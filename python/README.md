# god-tibo-imagen

Python SDK for sending image-generation requests to Codex's private ChatGPT-authenticated backend path.

> WARNING: This is **not** a supported public API integration. It depends on private Codex request behavior that may change without notice.

## Installation

```bash
pip install god-tibo-imagen
```

## Usage

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

### Image input

You can provide existing images as additional context alongside your text prompt. Images are embedded as base64 data URLs and sent with the request.

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

Supported formats: `png`, `jpg`/`jpeg`, `gif`, `webp`.

### Image model (ChatGPT Images 2.5)

Pass `image_model` to select the model used by the `image_generation` tool itself. ChatGPT Images 2.5 (released 2026-09-08) ships two API models:

- `gpt-image-2.5-flare` — the default fast tier (up to 50% lower latency than Images 2.0)
- `gpt-image-2.5-sunburst` — the slower, higher-precision tier

```python
result = client.generate_image(
    prompt="a sunset over mountains",
    model="gpt-5.4",
    output_path="./sunset.png",
    image_model="gpt-image-2.5-flare"
)
```

The value is forwarded as `model` on the `image_generation` tool config in the private Codex request. You can also set `CODEX_IMAGEGEN_IMAGE_MODEL` as the default.

### Dry run

```python
result = client.generate_image(
    prompt="flat blue square icon",
    dry_run=True
)
print(result["mode"])  # "dry-run"
```
