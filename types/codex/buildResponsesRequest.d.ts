/**
 * Return a redacted copy of request headers for debug output.
 *
 * @param {Record<string, string>} headers - Original request headers.
 * @returns {Record<string, string>} Redacted headers.
 */
export function sanitizeHeaders(headers: Record<string, string>): Record<string, string>;
/**
 * Return a redacted copy of the request body for debug output.
 *
 * @param {{ client_metadata?: Record<string, string>, input?: Array<{ content?: Array<{ type?: string, image_url?: string }> }> } & Record<string, unknown>} body - Original request body.
 * @returns {{ client_metadata?: Record<string, string>, input?: Array<{ content?: Array<{ type?: string, image_url?: string }> }> } & Record<string, unknown>} Redacted body.
 */
export function sanitizeRequestBody(body: {
    client_metadata?: Record<string, string>;
    input?: Array<{
        content?: Array<{
            type?: string;
            image_url?: string;
        }>;
    }>;
} & Record<string, unknown>): {
    client_metadata?: Record<string, string>;
    input?: Array<{
        content?: Array<{
            type?: string;
            image_url?: string;
        }>;
    }>;
} & Record<string, unknown>;
/**
 * Build the private Codex `/responses` request payload.
 *
 * @param {{ baseUrl: string, session: { accessToken: string, accountId: string, installationId?: string | null }, prompt: string, model: string, originator: string, includeReasoning?: boolean, sessionId?: string, images?: string[] }} options - Request inputs.
 * @returns {{ url: string, sessionId: string, headers: Record<string, string>, body: Record<string, unknown>, sanitized: { url: string, headers: Record<string, string>, body: Record<string, unknown> } }} Request details and a redacted debug copy.
 */
export function buildResponsesRequest({ baseUrl, session, prompt, model, originator, includeReasoning, sessionId, images }: {
    baseUrl: string;
    session: {
        accessToken: string;
        accountId: string;
        installationId?: string | null;
    };
    prompt: string;
    model: string;
    originator: string;
    includeReasoning?: boolean;
    sessionId?: string;
    images?: string[];
}): {
    url: string;
    sessionId: string;
    headers: Record<string, string>;
    body: Record<string, unknown>;
    sanitized: {
        url: string;
        headers: Record<string, string>;
        body: Record<string, unknown>;
    };
};
export const REDACTED_ACCOUNT_ID: "[REDACTED_ACCOUNT_ID]";
export const REDACTED_SESSION_ID: "[REDACTED_SESSION_ID]";
export const REDACTED_INSTALLATION_ID: "[REDACTED_INSTALLATION_ID]";
export const REDACTED_IMAGE_DATA: "[REDACTED_IMAGE_DATA]";
