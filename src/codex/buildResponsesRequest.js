// @ts-nocheck
import crypto from 'node:crypto';

export const REDACTED_ACCOUNT_ID = '[REDACTED_ACCOUNT_ID]';
export const REDACTED_SESSION_ID = '[REDACTED_SESSION_ID]';
export const REDACTED_INSTALLATION_ID = '[REDACTED_INSTALLATION_ID]';
export const REDACTED_IMAGE_DATA = '[REDACTED_IMAGE_DATA]';

/**
 * Return a redacted copy of request headers for debug output.
 *
 * @param {Record<string, string>} headers - Original request headers.
 * @returns {Record<string, string>} Redacted headers.
 */
export function sanitizeHeaders(headers) {
  const clone = { ...headers };
  if (clone.Authorization) {
    clone.Authorization = 'Bearer [REDACTED]';
  }
  if (clone['ChatGPT-Account-ID']) {
    clone['ChatGPT-Account-ID'] = REDACTED_ACCOUNT_ID;
  }
  if (clone.session_id) {
    clone.session_id = REDACTED_SESSION_ID;
  }
  return clone;
}

/**
 * Return a redacted copy of the request body for debug output.
 *
 * @param {{ client_metadata?: Record<string, string>, input?: Array<{ content?: Array<{ type?: string, image_url?: string }> }> } & Record<string, unknown>} body - Original request body.
 * @returns {{ client_metadata?: Record<string, string>, input?: Array<{ content?: Array<{ type?: string, image_url?: string }> }> } & Record<string, unknown>} Redacted body.
 */
export function sanitizeRequestBody(body) {
  const clone = { ...body };

  if (body?.client_metadata) {
    clone.client_metadata = {
      ...body.client_metadata,
      'x-codex-installation-id': REDACTED_INSTALLATION_ID
    };
  }

  if (Array.isArray(body?.input)) {
    clone.input = body.input.map((item) => {
      if (!Array.isArray(item?.content)) {
        return item;
      }
      return {
        ...item,
        content: item.content.map((block) => {
          if (block?.type === 'input_image' && block?.image_url) {
            return { ...block, image_url: REDACTED_IMAGE_DATA };
          }
          return block;
        })
      };
    });
  }

  return clone;
}

/**
 * Build the private Codex `/responses` request payload.
 *
 * @param {{ baseUrl: string, session: { accessToken: string, accountId: string, installationId?: string | null }, prompt: string, model: string, originator: string, includeReasoning?: boolean, sessionId?: string, images?: string[], size?: string }} options - Request inputs.
 * @returns {{ url: string, sessionId: string, headers: Record<string, string>, body: Record<string, unknown>, sanitized: { url: string, headers: Record<string, string>, body: Record<string, unknown> } }} Request details and a redacted debug copy.
 */
export function buildResponsesRequest({
  baseUrl,
  session,
  prompt,
  model,
  originator,
  includeReasoning = true,
  sessionId = crypto.randomUUID(),
  images,
  size
}) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required.');
  }

  const url = new URL('responses', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  const headers = {
    Authorization: `Bearer ${session.accessToken}`,
    'ChatGPT-Account-ID': session.accountId,
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    originator,
    session_id: sessionId
  };

  const content = [{ type: 'input_text', text: prompt }];
  if (images && images.length > 0) {
    for (const image of images) {
      content.push({ type: 'input_image', image_url: image });
    }
  }

  const body = {
    model,
    instructions: '',
    input: [
      {
        type: 'message',
        role: 'user',
        content
      }
    ],
    tools: [{
      type: 'image_generation',
      output_format: 'png',
      ...(size ? { size } : {})
    }],
    tool_choice: 'auto',
    parallel_tool_calls: false,
    reasoning: null,
    store: false,
    stream: true,
    include: includeReasoning ? ['reasoning.encrypted_content'] : [],
    client_metadata: session.installationId
      ? { 'x-codex-installation-id': session.installationId }
      : undefined
  };

  return {
    url,
    sessionId,
    headers,
    body,
    sanitized: {
      url,
      headers: sanitizeHeaders(headers),
      body: sanitizeRequestBody(body)
    }
  };
}
