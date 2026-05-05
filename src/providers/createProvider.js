// @ts-nocheck
import { createCodexCliProvider } from './codexCliProvider.js';
import { createPrivateCodexProvider } from './privateCodexProvider.js';
import {
  AUTO_PROVIDER,
  CODEX_CLI_PROVIDER,
  PRIVATE_CODEX_PROVIDER
} from './providerTypes.js';

/**
 * Create the configured provider implementation.
 *
 * @param {{ provider: string, baseUrl?: string, authFile?: string, installationIdFile?: string, generatedImagesDir?: string, defaultOriginator?: string }} config - Resolved runtime configuration.
 * @returns {{ generateImage: (args: unknown) => Promise<unknown> }} Provider with a generateImage method.
 */
export function createProvider(config) {
  const privateProvider = createPrivateCodexProvider(config);
  const cliProvider = createCodexCliProvider(config);

  switch (config.provider) {
    case PRIVATE_CODEX_PROVIDER:
      return privateProvider;
    case CODEX_CLI_PROVIDER:
      return cliProvider;
    case AUTO_PROVIDER:
      return {
        async generateImage(args) {
          try {
            const result = await privateProvider.generateImage(args);
            return { ...result, provider: PRIVATE_CODEX_PROVIDER };
          } catch (privateError) {
            if (args?.size) {
              const error = new Error('The auto provider cannot fall back to codex-cli when --size is set because codex-cli cannot honor output dimensions.');
              error.code = 'SIZE_UNSUPPORTED_BY_FALLBACK';
              error.cause = privateError;
              throw error;
            }
            const cliResult = await cliProvider.generateImage(args);
            return {
              ...cliResult,
              provider: CODEX_CLI_PROVIDER,
              warnings: [
                ...(cliResult.warnings || []),
                `Primary provider failed and auto fallback switched to codex-cli: ${privateError.code || privateError.message}`
              ]
            };
          }
        }
      };
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
