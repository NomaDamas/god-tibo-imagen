/**
 * Create a provider that uses `codex exec` as the image-generation fallback.
 *
 * @param {{ generatedImagesDir: string }} config - Runtime configuration.
 * @returns {{ generateImage: (args: { prompt: string, model?: string, outputPath: string, debug?: boolean, debugDir?: string, execImpl?: typeof runCommand, images?: string[], size?: string }) => Promise<{ mode: string, provider: string, warnings: string[], responseId: null, sessionId: string | null, savedPath: string, revisedPrompt: null, request: unknown, response: unknown }> }} Provider implementation.
 */
export function createCodexCliProvider(config: {
    generatedImagesDir: string;
}): {
    generateImage: (args: {
        prompt: string;
        model?: string;
        outputPath: string;
        debug?: boolean;
        debugDir?: string;
        execImpl?: typeof runCommand;
        images?: string[];
        size?: string;
    }) => Promise<{
        mode: string;
        provider: string;
        warnings: string[];
        responseId: null;
        sessionId: string | null;
        savedPath: string;
        revisedPrompt: null;
        request: unknown;
        response: unknown;
    }>;
};
export namespace codexCliProviderInternals {
    export { buildWrappedPrompt };
    export { extractSessionId };
    export { findGeneratedImage };
}
declare function runCommand(file: any, args: any, options?: {}): Promise<any>;
declare function buildWrappedPrompt(prompt: any): string;
declare function extractSessionId(output: any): any;
declare function findGeneratedImage({ generatedImagesDir, sessionId, startedAtMs }: {
    generatedImagesDir: any;
    sessionId: any;
    startedAtMs: any;
}): Promise<any>;
export {};
