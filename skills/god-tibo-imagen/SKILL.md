---
name: god-tibo-imagen
description: >-
  Use when the user wants to generate images via the god-tibo-imagen Python SDK
  or Node.js CLI using their local Codex ChatGPT authentication.
  Trigger phrases: "image generation with gti", "run god-tibo-imagen",
  "generate with god-tibo-imagen", "use the gti private backend",
  "gti --prompt".
  Do NOT use for general image editing, public OpenAI Images API calls, or
  any request that does not specifically target the god-tibo-imagen project.
---

# god-tibo-imagen Agent Skill

This skill wraps the `god-tibo-imagen` Python SDK (and equivalent Node.js CLI)
into a repeatable workflow for any coding agent that supports the Agent Skills
format (Claude Code, Codex, Cursor, OpenCode, Continue, Gemini CLI, etc.).

It is the canonical cross-agent replacement for the older Codex-only
`examples/codex-skill/` example.

## Prerequisites

- Python 3.10+ (for the Python SDK and the bundled wrapper script)
- `pip install god-tibo-imagen` (the Python import name is `gti`, not
  `god_tibo_imagen`)
- Local Codex ChatGPT auth in `~/.codex/auth.json` with `auth_mode = chatgpt`
- A Codex/ChatGPT account entitled to image generation on the private backend

The agent should NOT attempt to install Codex or fabricate auth state; if the
auth file is missing, surface that to the user and stop.

## Wrapper script

The wrapper lives at `scripts/wrapper.py` (relative to this skill directory)
and provides a stable argparse interface over the `gti` Python SDK.

### Dry run (recommended for testing)

```bash
python skills/god-tibo-imagen/scripts/wrapper.py \
  --prompt "flat blue square icon" \
  --output ./test.png \
  --dry-run
```

### Live generation

```bash
python skills/god-tibo-imagen/scripts/wrapper.py \
  --prompt "flat blue square icon" \
  --output ./out.png
```

### With image inputs

```bash
python skills/god-tibo-imagen/scripts/wrapper.py \
  --prompt "Make this cat wear a hat" \
  --image ./cat.png \
  --output ./cat-hat.png
```

### Override auth paths

```bash
python skills/god-tibo-imagen/scripts/wrapper.py \
  --prompt "flat blue square icon" \
  --output ./out.png \
  --auth-file /custom/path/auth.json \
  --installation-id-file /custom/path/installation_id
```

## Python SDK direct usage

If you prefer to use the SDK directly instead of the wrapper:

```python
from gti import Client

client = Client(provider="private-codex")
result = client.generate_image(
    prompt="flat blue square icon",
    model="gpt-5.4",
    output_path="./out.png",
)
print(result.saved_path)
```

## Node.js CLI direct usage

```bash
gti --prompt "flat blue square icon" --output ./out.png
```

## Agent-specific configuration

Some agents may consume an additional interface descriptor. The Codex/OpenAI
interface descriptor lives at `agents/openai.yaml` inside this skill directory
and is loaded by Codex only — other agents will safely ignore it.

## Notes

- The Python version matters: requires Python 3.10 or later.
- The Python import name is `gti`, not `god_tibo_imagen`.
- Local Codex auth must be ChatGPT-backed (`auth_mode = chatgpt` in
  `~/.codex/auth.json`); API-key mode is not supported for the private backend
  path.
- In `--dry-run` mode the wrapper validates auth and prints the request
  without making a live network call.
- This skill is intentionally read-only with respect to your codebase: it
  only invokes the public `gti` SDK and writes to the `--output` path you
  specify.
