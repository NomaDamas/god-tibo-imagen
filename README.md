<p align="center">
  <img src="assets/saint-tibo.png" alt="Saint Tibo" width="600">
</p>

# god-tibo-imagen

Node.js library and CLI for sending image-generation requests to Codex's private ChatGPT-authenticated backend path.

> WARNING: This is **not** a supported public API integration. It depends on private Codex request behavior that may change without notice.

## What it does

- Reuses local Codex ChatGPT auth from `~/.codex/auth.json`
- Reads `~/.codex/installation_id` when available
- Sends a `POST` request to `https://chatgpt.com/backend-api/codex/responses`
- Requests the built-in `image_generation` tool with `output_format: png`
- Parses streamed SSE output and saves the resulting PNG
- Supports dry-run and sanitized debug dumps with request/response metadata minimization
- Also supports a `codex exec` fallback provider that verifies real PNG output from `~/.codex/generated_images/`

## Requirements

- Node.js 20+
- Existing local Codex ChatGPT login state
- A Codex/ChatGPT account that is entitled to image generation on the private backend

## Installation Guide

### Prerequisites

- **Node.js 20+** (for CLI and Node.js library)
- **Python 3.10+** (for Python SDK)
- Existing local Codex ChatGPT login state (`~/.codex/auth.json`)
- A Codex/ChatGPT account entitled to image generation on the private backend

### CLI (global)

```bash
npm install -g god-tibo-imagen
```

After installation, the `gti` command is available globally:

```bash
gti --version
gti --help
```

### Node.js Library

```bash
npm install god-tibo-imagen
```

```javascript
import { createProvider, resolveConfig } from 'god-tibo-imagen';
```

### Python SDK

```bash
pip install god-tibo-imagen
```

```python
from gti import Client
```

---

## CLI Usage

```bash
npm test
npm run check
gti --prompt "flat blue square icon" --output ./out/blue-square.png
```

### Image input

You can provide existing images as additional context alongside your text prompt. Images are embedded as base64 data URLs and sent with the request. Use `--image` multiple times for multiple images.

```bash
# single image
gti --prompt "Make this cat wear a hat" --image ./cat.png --output ./cat-hat.png

# multiple images
gti --prompt "Combine these two styles" --image ./style-a.png --image ./style-b.png --output ./combined.png
```

Supported formats: `png`, `jpg`/`jpeg`, `gif`, `webp`.

### Output size

Pass `--size <value>` to control the output image dimensions. Supported values match the gpt-image-2 spec:

```bash
gti --prompt "a sunset over mountains" --size 1536x1024 --output ./sunset.png
```

Supported sizes:

- `auto` (model decides)
- `1024x1024`, `2048x2048` (square)
- `1536x1024`, `2048x1152`, `3840x2160` (landscape)
- `1024x1536`, `2160x3840` (portrait)

The `--size` flag is forwarded to the `image_generation` tool config and is honored by the private Codex backend. The `codex-cli` provider does not support `--size`; direct `codex-cli` use and `auto` fallback fail fast rather than silently ignoring requested dimensions.

### Provider modes

```bash
# direct private HTTP path
gti --provider private-codex --prompt "flat blue square icon" --output ./out.png

# borrow the Hermes-style codex exec workaround
gti --provider codex-cli --prompt "flat blue square icon" --output ./out.png

# try private HTTP first, then fall back to codex-cli
gti --provider auto --prompt "flat blue square icon" --output ./out.png
```

### Dry run

```bash
gti --prompt "flat blue square icon" --dry-run
```

### Live smoke test

```bash
npm run smoke:live -- "Generate a tiny flat blue square icon." ./smoke-output.png
```

## Programmatic API (Node.js)

```javascript
import { createProvider, resolveConfig, loadCodexSession, validateCodexSession } from 'god-tibo-imagen';

const config = resolveConfig({ provider: 'private-codex' });
const provider = createProvider(config);

const result = await provider.generateImage({
  prompt: 'flat blue square icon',
  model: 'gpt-5.4',
  outputPath: './out.png',
  dryRun: false,
  debug: false
});

console.log(result.savedPath);
```

You can also pass existing images as input:

```javascript
// single image
const result = await provider.generateImage({
  prompt: 'Make this cat wear a hat',
  model: 'gpt-5.4',
  outputPath: './cat-hat.png',
  images: ['data:image/png;base64,iVBORw0KGgo...']
});

// with output size
const result = await provider.generateImage({
  prompt: 'a sunset over mountains',
  model: 'gpt-5.4',
  outputPath: './sunset.png',
  size: '1536x1024'
});

// multiple images
const result = await provider.generateImage({
  prompt: 'Combine these two styles',
  model: 'gpt-5.4',
  outputPath: './combined.png',
  images: [
    'data:image/png;base64,abc...',
    'data:image/png;base64,def...'
  ]
});
```

## Python SDK

```python
from gti import Client

client = Client(provider="private-codex")
result = client.generate_image(
    prompt="flat blue square icon",
    model="gpt-5.4",
    output_path="./out.png"
)
print(result.saved_path)

# with output size
result = client.generate_image(
    prompt="a sunset over mountains",
    model="gpt-5.4",
    output_path="./sunset.png",
    size="1536x1024"
)
print(result.saved_path)
```

You can also pass existing images as input:

```python
# single image
result = client.generate_image(
    prompt="Make this cat wear a hat",
    model="gpt-5.4",
    output_path="./cat-hat.png",
    image_paths="./cat.png"
)

# multiple images
result = client.generate_image(
    prompt="Combine these two styles",
    model="gpt-5.4",
    output_path="./combined.png",
    image_paths=["./style-a.png", "./style-b.png"]
)
```



## Quick Start

### 1. Generate an image via CLI

```bash
gti --prompt "flat blue square icon" --output ./out.png
```

### 2. Use in a Node.js script

```javascript
import { createProvider, resolveConfig } from 'god-tibo-imagen';

const config = resolveConfig({ provider: 'private-codex' });
const provider = createProvider(config);

const result = await provider.generateImage({
  prompt: 'flat blue square icon',
  model: 'gpt-5.4',
  outputPath: './out.png',
});

console.log(result.savedPath);
```

### 3. Use in a Python script

```python
from gti import Client

client = Client(provider="private-codex")
result = client.generate_image(
    prompt="flat blue square icon",
    model="gpt-5.4",
    output_path="./out.png"
)
print(result.saved_path)
```

With image inputs:

```python
result = client.generate_image(
    prompt="Make this cat wear a hat",
    model="gpt-5.4",
    output_path="./cat-hat.png",
    image_paths="./cat.png"
)
print(result.saved_path)
```

## Agent Skill (cross-agent)

For users who want to invoke `god-tibo-imagen` from within any coding agent that supports the [Agent Skills](https://agentskills.io/specification) format (Claude Code, Codex, Cursor, OpenCode, Continue, Gemini CLI, etc.), a portable skill is provided in `skills/god-tibo-imagen/`.

### Setup

- Python 3.10+
- `pip install god-tibo-imagen` (the import name is `gti`, not `god_tibo_imagen`)
- Local Codex auth in `~/.codex/auth.json` with `auth_mode = chatgpt`

### Wrapper script

```bash
# Dry run
python skills/god-tibo-imagen/scripts/wrapper.py --prompt "flat blue square icon" --output ./test.png --dry-run

# Live generation
python skills/god-tibo-imagen/scripts/wrapper.py --prompt "flat blue square icon" --output ./out.png

# With image inputs
python skills/god-tibo-imagen/scripts/wrapper.py --prompt "Make this cat wear a hat" --image ./cat.png --output ./cat-hat.png
```

### Skill file

The skill definition is at `skills/god-tibo-imagen/SKILL.md`. Install it by copying or symlinking the `skills/god-tibo-imagen/` directory into your agent's skills path:

- Claude Code: `~/.claude/skills/god-tibo-imagen/`
- Codex: `~/.codex/skills/god-tibo-imagen/` (or project-local `.agents/skills/god-tibo-imagen/`)
- OpenCode: `~/.config/opencode/skills/god-tibo-imagen/`
- Cursor / Continue / Gemini CLI / Kiro: `.agents/skills/god-tibo-imagen/` (project)

Or use the Vercel `skills` CLI:

```bash
npx skills add NomaDamas/god-tibo-imagen --skill god-tibo-imagen
```

See `skills/god-tibo-imagen/README.md` for detailed installation per agent.

## Key files

- `src/auth/loadCodexSession.js` — reads Codex auth state
- `src/auth/validateSession.js` — validates required private-backend fields
- `src/codex/buildResponsesRequest.js` — builds the `/responses` request
- `src/codex/streamResponsesSse.js` — parses SSE events
- `src/codex/extractImageGeneration.js` — finds `image_generation_call`
- `src/providers/privateCodexProvider.js` — live request/response orchestration
- `src/providers/codexCliProvider.js` — Hermes-style `codex exec` fallback with file verification
- `src/providers/createProvider.js` — provider selection and auto fallback
- `src/cli/generate.js` — CLI entry point

## Notes

- This MVP supports the file-backed `~/.codex/auth.json` path.
- If your Codex install stores auth only in a keyring and does not materialize `auth.json`, this MVP will not discover it yet.
- Debug dumps redact bearer tokens, account/session identifiers, installation IDs, cookies, and image payload base64, and store a minimized response summary instead of the raw response body.
- The architecture now supports both the direct private HTTP client and a Hermes-style `codex exec` fallback, while keeping the provider seam open for future `app-server` integration.
