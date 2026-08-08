// @ts-nocheck
import crypto from 'node:crypto';

export const REDACTED_ACCOUNT_ID = '[REDACTED_ACCOUNT_ID]';
export const REDACTED_SESSION_ID = '[REDACTED_SESSION_ID]';
export const REDACTED_INSTALLATION_ID = '[REDACTED_INSTALLATION_ID]';
export const REDACTED_IMAGE_DATA = '[REDACTED_IMAGE_DATA]';
export const SUPPORTED_IMAGE_SIZES = new Set([
  'auto',
  '1024x1024',
  '1536x1024',
  '1024x1536',
  '2048x2048',
  '2048x1152',
  '3840x2160',
  '2160x3840'
]);

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

const DEFAULT_IMAGEGEN_INSTRUCTIONS =
  'You are an image generation assistant. Always use the image_generation tool to produce the requested image. Do not answer with text only.';

/**
 * Build the private Codex `/responses` request payload.
 *
 * Live contract (verified 2026-08-08 against chatgpt.com/backend-api/codex/responses):
 * - tools: [{ type: 'image_generation', output_format: 'png', size? }] works
 * - non-empty instructions required to bias the model toward image_generation_call
 * - tool_choice ('required' | 'auto' | allowed_tools | object) → HTTP 400 or no image
 * - parallel_tool_calls / reasoning / include extras are unnecessary for image gen;
 *   keep the body minimal so the model actually emits image_generation_call
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
  includeReasoning = false,
  sessionId = crypto.randomUUID(),
  images,
  size
}) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required.');
  }
  if (size && !SUPPORTED_IMAGE_SIZES.has(size)) {
    throw new Error(`Unsupported image size: ${size}. Supported sizes: ${Array.from(SUPPORTED_IMAGE_SIZES).join(', ')}.`);
  }

  const url = new URL('responses', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  const headers = {
    Authorization: `Bearer ${session.accessToken}`,
    'ChatGPT-Account-ID': session.accountId,
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    originator,
    'User-Agent': originator || 'codex_cli_rs',
    session_id: sessionId
  };

  const content = [{ type: 'input_text', text: prompt }];
  if (images && images.length > 0) {
    for (const image of images) {
      content.push({ type: 'input_image', image_url: image });
    }
  }

  const imageModel = process.env.CODEX_IMAGEGEN_IMAGE_MODEL || '';
  const imageTool = {
    type: 'image_generation',
    output_format: 'png',
    ...(size ? { size } : {}),
    ...(imageModel ? { model: imageModel } : {}),
    ...(process.env.CODEX_IMAGEGEN_QUALITY ? { quality: process.env.CODEX_IMAGEGEN_QUALITY } : {})
  };

  const instructions = (
    process.env.CODEX_IMAGEGEN_INSTRUCTIONS || DEFAULT_IMAGEGEN_INSTRUCTIONS
  ).trim();
  if (!instructions) {
    throw new Error('Image generation instructions must be non-empty.');
  }

  // Minimal body — do NOT set tool_choice / parallel_tool_calls / reasoning.
  // Those fields either 400 or suppress image_generation_call on current codex backend.
  const body = {
    model,
    instructions,
    input: [
      {
        type: 'message',
        role: 'user',
        content
      }
    ],
    tools: [imageTool],
    store: false,
    stream: true
  };

  if (includeReasoning) {
    body.include = ['reasoning.encrypted_content'];
  }

  if (session.installationId) {
    body.client_metadata = { 'x-codex-installation-id': session.installationId };
  }

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
