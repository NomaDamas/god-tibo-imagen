/**
 * Resolve the runtime configuration for the CLI/library.
 *
 * @param {{ codexHome?: string, baseUrl?: string, authFile?: string, installationIdFile?: string, generatedImagesDir?: string, provider?: string, defaultModel?: string, defaultImageModel?: string, originator?: string, defaultOutputPath?: string }} [overrides={}] - Optional configuration overrides.
 * @returns {{ baseUrl: string, codexHome: string, authFile: string, installationIdFile: string, generatedImagesDir: string, provider: string, defaultModel: string, defaultImageModel: string, defaultOriginator: string, defaultOutputPath: string }} Fully resolved config.
 */
export function resolveConfig(overrides?: {
    codexHome?: string;
    baseUrl?: string;
    authFile?: string;
    installationIdFile?: string;
    generatedImagesDir?: string;
    provider?: string;
    defaultModel?: string;
    defaultImageModel?: string;
    originator?: string;
    defaultOutputPath?: string;
}): {
    baseUrl: string;
    codexHome: string;
    authFile: string;
    installationIdFile: string;
    generatedImagesDir: string;
    provider: string;
    defaultModel: string;
    defaultImageModel: string;
    defaultOriginator: string;
    defaultOutputPath: string;
};
export const DEFAULT_IMAGE_MODEL: "gpt-image-2.5-flare";
export const UNSUPPORTED_WARNING: "WARNING: This project calls an unsupported private Codex backend path. The contract may break without notice.";
