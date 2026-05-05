---
name: god-tibo-imagen
description: >
  Use when the user wants to generate images via the god-tibo-imagen Python SDK
  using local Codex ChatGPT authentication.
  Trigger phrases: "image generation with gti", "run god-tibo-imagen",
  "generate with god-tibo-imagen", "use the gti private backend".
  Do NOT use for general image editing or public API image generation.
argument-hint: "[--prompt <text>] [--output <path>] [--dry-run]"
---

# god-tibo-imagen Codex Skill

This skill wraps the `god-tibo-imagen` Python SDK into a repeatable workflow
that is easier to invoke from Codex.

## Prerequisites

- Python 3.10+
- `pip install god-tibo-imagen` (the import name is `gti`, not `god_tibo_imagen`)
- Local Codex auth in `~/.codex/auth.json` with `auth_mode = chatgpt`
- A Codex/ChatGPT account entitled to image generation on the private backend

## Wrapper script

The wrapper lives at `examples/codex-skill-wrapper.py` and provides a simple
argparse interface over the Python SDK.

### Dry run (recommended for testing)

```bash
python examples/codex-skill-wrapper.py \
  --prompt "flat blue square icon" \
  --output ./test.png \
  --dry-run
```

### Live generation

```bash
python examples/codex-skill-wrapper.py \
  --prompt "flat blue square icon" \
  --output ./out.png
```

### With image inputs

```bash
python examples/codex-skill-wrapper.py \
  --prompt "Make this cat wear a hat" \
  --image ./cat.png \
  --output ./cat-hat.png
```

### Override auth paths

```bash
python examples/codex-skill-wrapper.py \
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
    output_path="./out.png"
)
print(result.saved_path)
```

## Notes

- The Python version matters: requires Python 3.10 or later.
- The import name is `gti`, not `god_tibo_imagen`.
- Local Codex auth must be ChatGPT-backed (`auth_mode = chatgpt` in `~/.codex/auth.json`); API-key mode is not supported for the private backend path.
- For dry-run, the wrapper validates auth and prints the request without making a live network call.
