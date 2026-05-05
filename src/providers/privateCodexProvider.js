// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';

import { loadCodexSession } from '../auth/loadCodexSession.js';
import { validateCodexSession } from '../auth/validateSession.js';
import {
  buildResponsesRequest,
  sanitizeHeaders,
  sanitizeRequestBody
} from '../codex/buildResponsesRequest.js';
import { extractImageGeneration } from '../codex/extractImageGeneration.js';
import { parseSseText } from '../codex/streamResponsesSse.js';
import { saveImage } from '../fs/saveImage.js';

function classifyFailure({ status, body }) {
  if (status === 401) {
    const error = new Error('Unauthorized from private Codex backend. Your local ChatGPT auth may be expired.');
    error.code = 'UNAUTHORIZED';
    error.status = status;
    error.body = body;
    return error;
  }

  const error = new Error(`Private Codex backend request failed with HTTP ${status}.`);
  error.code = 'HTTP_ERROR';
  error.status = status;
  error.body = body;
  return error;
}

function redactSecrets(value) {
  return String(value ?? '')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]')
    .replace(/"ChatGPT-Account-ID":"[^"]+"/g, '"ChatGPT-Account-ID":"[REDACTED_ACCOUNT_ID]"')
    .replace(/"session_id":"[^"]+"/g, '"session_id":"[REDACTED_SESSION_ID]"')
    .replace(/"x-codex-installation-id":"[^"]+"/g, '"x-codex-installation-id":"[REDACTED_INSTALLATION_ID]"')
    .replace(/"partial_image_b64":"[^"]+"/g, '"partial_image_b64":"[REDACTED_IMAGE_B64]"')
    .replace(/"result":"[^"]+"/g, '"result":"[REDACTED_IMAGE_B64]"');
}

const SAFE_RESPONSE_HEADERS = new Set([
  'content-type',
  'x-oai-request-id',
  'x-codex-plan-type',
  'x-codex-active-limit',
  'x-models-etag'
]);

function sanitizeResponseHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers).filter(([key]) => SAFE_RESPONSE_HEADERS.has(key.toLowerCase()))
  );
}

function summarizeEvents(events) {
  const counts = {};
  for (const event of events) {
    const key = event?.data?.type || event?.event || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function summarizeItems(items) {
  return items.map((item) => ({
    type: item?.type ?? 'unknown',
    status: item?.status ?? null,
    hasResult: Boolean(item?.result),
    hasRevisedPrompt: Boolean(item?.revised_prompt),
    role: item?.role ?? null
  }));
}

function buildDebugResponseBody({ parsed, responseBody }) {
  if (!parsed) {
    return {
      format: 'unparsed',
      body: redactSecrets(responseBody)
    };
  }

  return {
    format: parsed.events.length > 0 ? 'sse' : 'json',
    responseIdPresent: Boolean(parsed.responseId),
    eventCounts: summarizeEvents(parsed.events),
    items: summarizeItems(parsed.items)
  };
}

async function writeDebugArtifacts({
  debugDir,
  request,
  responseStatus,
  responseHeaders,
  responseBody,
  parsed = null
}) {
  if (!debugDir) {
    return;
  }

  await fs.mkdir(debugDir, { recursive: true });
  const requestDump = {
    url: request.url,
    headers: sanitizeHeaders(request.headers),
    body: sanitizeRequestBody(request.body)
  };
  await fs.writeFile(path.join(debugDir, 'request.json'), JSON.stringify(requestDump, null, 2));

  const responseDump = {
    status: responseStatus,
    headers: sanitizeResponseHeaders(responseHeaders),
    body: buildDebugResponseBody({ parsed, responseBody })
  };
  await fs.writeFile(path.join(debugDir, 'response.json'), JSON.stringify(responseDump, null, 2));
}

/**
 * Create a provider that talks directly to the private Codex HTTP backend.
 *
 * @param {{ baseUrl: string, authFile: string, installationIdFile: string, defaultOriginator: string }} config - Runtime configuration.
 * @returns {{ generateImage: (args: { prompt: string, model: string, outputPath: string, dryRun?: boolean, debug?: boolean, debugDir?: string, fetchImpl?: typeof fetch, images?: string[], size?: string }) => Promise<{ mode: string, warnings: string[], responseId: string | null, sessionId?: string, savedPath?: string, revisedPrompt: string | null, request: unknown, response?: unknown }> }} Provider implementation.
 */
export function createPrivateCodexProvider(config) {
  return {
    async generateImage({ prompt, model, outputPath, dryRun = false, debug = false, debugDir, fetchImpl = globalThis.fetch, images, size }) {
      const session = await loadCodexSession(config);
      const validation = validateCodexSession(session);
      const request = buildResponsesRequest({
        baseUrl: config.baseUrl,
        session,
        prompt,
        model,
        originator: config.defaultOriginator,
        images,
        size
      });

      if (dryRun) {
        return {
          mode: 'dry-run',
          warnings: validation.warnings,
          request: request.sanitized
        };
      }

      if (typeof fetchImpl !== 'function') {
        throw new Error('No fetch implementation is available in this Node runtime.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300_000);

      const response = await fetchImpl(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseHeaders = Object.fromEntries(response.headers.entries());
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        const failureText = await response.text();
        if (debug) {
          await writeDebugArtifacts({
            debugDir,
            request,
            responseStatus: response.status,
            responseHeaders,
            responseBody: failureText
          });
        }
        throw classifyFailure({ status: response.status, body: failureText });
      }

      const responseBodyForDebug = await response.text();
      let parsed;
      try {
        const trimmed = responseBodyForDebug.trimStart();
        const shouldParseAsSse =
          contentType.includes('text/event-stream') ||
          trimmed.startsWith('event:') ||
          trimmed.startsWith('data:');

        if (shouldParseAsSse) {
          parsed = parseSseText(responseBodyForDebug);
        } else {
          const payload = JSON.parse(responseBodyForDebug);
          parsed = {
            events: [],
            items: Array.isArray(payload?.output) ? payload.output : [],
            responseId: payload?.id ?? null
          };
        }
      } catch (error) {
        if (debug) {
          await writeDebugArtifacts({
            debugDir,
            request,
            responseStatus: response.status,
            responseHeaders,
            responseBody: responseBodyForDebug
          });
        }
        throw error;
      }

      if (debug) {
        await writeDebugArtifacts({
          debugDir,
          request,
          responseStatus: response.status,
          responseHeaders,
          responseBody: responseBodyForDebug,
          parsed
        });
      }

      const generation = extractImageGeneration(parsed);
      const savedPath = await saveImage({ resultBase64: generation.resultBase64, outputPath });

      return {
        mode: 'live',
        warnings: validation.warnings,
        responseId: parsed.responseId,
        sessionId: request.sessionId,
        savedPath,
        revisedPrompt: generation.revisedPrompt,
        request: request.sanitized,
        response: {
          status: response.status,
          headers: responseHeaders,
          itemCount: parsed.items.length
        }
      };
    }
  };
}
