#!/usr/bin/env node
// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveConfig, UNSUPPORTED_WARNING } from '../config.js';
import { createProvider } from '../providers/createProvider.js';
import { SUPPORTED_PROVIDERS } from '../providers/providerTypes.js';

const EXT_TO_MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp'
};

function parseArgs(argv) {
  const parsed = {
    dryRun: false,
    debug: false,
    output: null,
    prompt: null,
    model: null,
    codexHome: null,
    baseUrl: null,
    authFile: null,
    installationIdFile: null,
    debugDir: null,
    provider: null,
    images: [],
    size: null,
    help: false,
    version: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    switch (token) {
      case '--prompt':
        parsed.prompt = next;
        index += 1;
        break;
      case '--output':
        parsed.output = next;
        index += 1;
        break;
      case '--model':
        parsed.model = next;
        index += 1;
        break;
      case '--codex-home':
        parsed.codexHome = next;
        index += 1;
        break;
      case '--base-url':
        parsed.baseUrl = next;
        index += 1;
        break;
      case '--auth-file':
        parsed.authFile = next;
        index += 1;
        break;
      case '--installation-id-file':
        parsed.installationIdFile = next;
        index += 1;
        break;
      case '--debug-dir':
        parsed.debugDir = next;
        index += 1;
        break;
      case '--provider':
        parsed.provider = next;
        index += 1;
        break;
      case '--image':
        parsed.images.push(next);
        index += 1;
        break;
      case '--size':
        parsed.size = next;
        index += 1;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--debug':
        parsed.debug = true;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      case '--version':
      case '-v':
        parsed.version = true;
        break;
      default:
        if (!token.startsWith('-') && !parsed.prompt) {
          parsed.prompt = token;
        } else if (!token.startsWith('-') && !parsed.output) {
          parsed.output = token;
        } else {
          throw new Error(`Unknown argument: ${token}`);
        }
    }
  }

  return parsed;
}

async function readImageAsDataUrl(imagePath) {
  const resolved = path.resolve(imagePath);
  let stats;
  try {
    stats = await fs.stat(resolved);
  } catch {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  if (!stats.isFile()) {
    throw new Error(`Image path is not a file: ${imagePath}`);
  }

  const ext = path.extname(resolved).toLowerCase().replace(/^\./, '');
  const mime = EXT_TO_MIME[ext];
  if (!mime) {
    throw new Error(`Unsupported image extension "${ext}". Supported: png, jpg, jpeg, gif, webp.`);
  }

  const buffer = await fs.readFile(resolved);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

async function readVersion() {
  const versionPath = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..', 'VERSION');
  try {
    return (await fs.readFile(versionPath, 'utf8')).trim();
  } catch {
    return '0.0.0';
  }
}

function printHelp() {
  console.log(`
${UNSUPPORTED_WARNING}

Usage:
  node src/cli/generate.js --prompt "flat blue square icon" --output ./out/image.png

Options:
  --prompt <text>               Required prompt text
  --output <path>               Output PNG path
  --model <name>                Model name (default: CODEX_IMAGEGEN_MODEL or gpt-5.4)
  --provider <name>             Provider: private-codex | codex-cli | auto
  --image <path>                Input image path (can be used multiple times)
  --size <value>                Output image size: auto, 1024x1024, 1536x1024, 1024x1536,
                                2048x2048, 2048x1152, 3840x2160, 2160x3840 (private-codex only)
  --dry-run                     Print the request shape without calling the backend
  --debug                       Write sanitized request/response dumps
  --debug-dir <path>            Directory for sanitized debug artifacts
  --codex-home <path>           Override CODEX_HOME
  --auth-file <path>            Override auth.json path
  --installation-id-file <path> Override installation_id path
  --base-url <url>              Override private Codex base URL
  -h, --help                    Show help
  -v, --version                 Print the gti version and exit
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.version) {
    console.log(await readVersion());
    return;
  }
  if (args.help || !args.prompt) {
    printHelp();
    if (!args.prompt && !args.help) {
      process.exitCode = 1;
    }
    return;
  }

  const config = resolveConfig(args);
  if (!SUPPORTED_PROVIDERS.includes(config.provider)) {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }
  const provider = createProvider(config);
  const outputPath = path.resolve(args.output || config.defaultOutputPath);

  const images = args.images.length > 0
    ? await Promise.all(args.images.map((img) => readImageAsDataUrl(img)))
    : undefined;

  console.warn(UNSUPPORTED_WARNING);
  const result = await provider.generateImage({
    prompt: args.prompt,
    model: args.model || config.defaultModel,
    outputPath,
    dryRun: args.dryRun,
    debug: args.debug,
    debugDir: args.debugDir ? path.resolve(args.debugDir) : args.debug ? path.resolve('.debug-codex-imagegen') : null,
    images,
    ...(args.size ? { size: args.size } : {})
  });

  if (result.mode === 'dry-run') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  for (const warning of result.warnings) {
    console.warn(`warning: ${warning}`);
  }

  console.log(JSON.stringify({
    provider: result.provider || config.provider,
    savedPath: result.savedPath,
    responseId: result.responseId,
    sessionId: result.sessionId,
    revisedPrompt: result.revisedPrompt,
    httpStatus: result.response.status
  }, null, 2));
}

main().catch((error) => {
  console.error(UNSUPPORTED_WARNING);
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
