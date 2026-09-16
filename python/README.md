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
    model="gpt-5.6-sol",
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
    model="gpt-5.6-sol",
    output_path="./cat-hat.png",
    image_paths="./cat.png"
)

# multiple images
result = client.generate_image(
    prompt="Combine these two styles",
    model="gpt-5.6-sol",
    output_path="./combined.png",
    image_paths=["./style-a.png", "./style-b.png"]
)
```

Supported formats: `png`, `jpg`/`jpeg`, `gif`, `webp`.

### Image model (ChatGPT Images 2.5)

The client defaults to ChatGPT Images 2.5 `gpt-image-2.5-sunburst`. Pass `image_model` to override:

- `gpt-image-2.5-sunburst` — default premium tier, built for workflows that benefit from tighter control across edits
- `gpt-image-2.5-flare` — fast tier: higher-quality images than GPT-Image-2 at up to 50% lower latency

```python
result = client.generate_image(
    prompt="a sunset over mountains",
    model="gpt-5.6-sol",
    output_path="./sunset.png",
)
result = client.generate_image(
    prompt="a sunset over mountains",
    model="gpt-5.6-sol",
    output_path="./sunset.png",
    image_model="gpt-image-2.5-flare",
)
```

The value is forwarded as `model` on the `image_generation` tool config. `CODEX_IMAGEGEN_IMAGE_MODEL` overrides the default. Note: the backend acknowledges the tool config with a normalized `gpt-image-2-codex` model in its response echo and does not validate the requested value — selection is therefore best-effort over a private, unvalidated contract.

### Dry run

```python
result = client.generate_image(
    prompt="flat blue square icon",
    dry_run=True
)
print(result["mode"])  # "dry-run"
```
