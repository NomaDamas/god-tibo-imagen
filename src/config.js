// @ts-nocheck
import os from 'node:os';
import path from 'node:path';

import { PRIVATE_CODEX_PROVIDER } from './providers/providerTypes.js';

const DEFAULT_CODEX_HOME = path.join(os.homedir(), '.codex');
export const DEFAULT_IMAGE_MODEL = 'gpt-image-2.5-flare';

/**
 * Resolve the runtime configuration for the CLI/library.
 *
 * @param {{ codexHome?: string, baseUrl?: string, authFile?: string, installationIdFile?: string, generatedImagesDir?: string, provider?: string, defaultModel?: string, defaultImageModel?: string, originator?: string, defaultOutputPath?: string }} [overrides={}] - Optional configuration overrides.
 * @returns {{ baseUrl: string, codexHome: string, authFile: string, installationIdFile: string, generatedImagesDir: string, provider: string, defaultModel: string, defaultImageModel: string, defaultOriginator: string, defaultOutputPath: string }} Fully resolved config.
 */
export function resolveConfig(overrides = {}) {
  const codexHome = overrides.codexHome || process.env.CODEX_HOME || DEFAULT_CODEX_HOME;
  const baseUrl = overrides.baseUrl || process.env.CODEX_IMAGEGEN_BASE_URL || 'https://chatgpt.com/backend-api/codex';
  const authFile = overrides.authFile || process.env.CODEX_IMAGEGEN_AUTH_FILE || path.join(codexHome, 'auth.json');
  const installationIdFile =
    overrides.installationIdFile ||
    process.env.CODEX_IMAGEGEN_INSTALLATION_ID_FILE ||
    path.join(codexHome, 'installation_id');
  const generatedImagesDir =
    overrides.generatedImagesDir ||
    process.env.CODEX_IMAGEGEN_GENERATED_IMAGES_DIR ||
    path.join(codexHome, 'generated_images');

  return {
    baseUrl,
    codexHome,
    authFile,
    installationIdFile,
    generatedImagesDir,
    provider: overrides.provider || process.env.CODEX_IMAGEGEN_PROVIDER || PRIVATE_CODEX_PROVIDER,
    defaultModel: overrides.defaultModel || process.env.CODEX_IMAGEGEN_MODEL || process.env.CODEX_MODEL || 'gpt-5.4',
    defaultImageModel: overrides.defaultImageModel || process.env.CODEX_IMAGEGEN_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
    defaultOriginator:
      overrides.originator || process.env.CODEX_IMAGEGEN_ORIGINATOR || process.env.CODEX_INTERNAL_ORIGINATOR_OVERRIDE || 'codex_cli_rs',
    defaultOutputPath:
      overrides.defaultOutputPath ||
      process.env.CODEX_IMAGEGEN_OUTPUT ||
      path.resolve(process.cwd(), `generated-${Date.now()}.png`)
  };
}

export const UNSUPPORTED_WARNING =
  'WARNING: This project calls an unsupported private Codex backend path. The contract may break without notice.';
