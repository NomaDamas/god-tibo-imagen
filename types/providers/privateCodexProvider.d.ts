/**
 * Create a provider that talks directly to the private Codex HTTP backend.
 *
 * @param {{ baseUrl: string, authFile: string, installationIdFile: string, defaultOriginator: string }} config - Runtime configuration.
 * @returns {{ generateImage: (args: { prompt: string, model: string, outputPath: string, dryRun?: boolean, debug?: boolean, debugDir?: string, fetchImpl?: typeof fetch, images?: string[], size?: string }) => Promise<{ mode: string, warnings: string[], responseId: string | null, sessionId?: string, savedPath?: string, revisedPrompt: string | null, request: unknown, response?: unknown }> }} Provider implementation.
 */
export function createPrivateCodexProvider(config: {
    baseUrl: string;
    authFile: string;
    installationIdFile: string;
    defaultOriginator: string;
}): {
    generateImage: (args: {
        prompt: string;
        model: string;
        outputPath: string;
        dryRun?: boolean;
        debug?: boolean;
        debugDir?: string;
        fetchImpl?: typeof fetch;
        images?: string[];
        size?: string;
    }) => Promise<{
        mode: string;
        warnings: string[];
        responseId: string | null;
        sessionId?: string;
        savedPath?: string;
        revisedPrompt: string | null;
        request: unknown;
        response?: unknown;
    }>;
};
