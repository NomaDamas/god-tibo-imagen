from __future__ import annotations

import base64
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .config import resolve_config
from .errors import make_error
from .provider import create_private_codex_provider

_EXTENSION_TO_MIME = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
}


def _image_path_to_data_url(image_path: str) -> str:
    path = Path(image_path)
    if not path.exists():
        raise make_error(f"Image file does not exist: {image_path}", code="IMAGE_NOT_FOUND")

    ext = path.suffix.lstrip(".").lower()
    mime = _EXTENSION_TO_MIME.get(ext)
    if mime is None:
        raise make_error(
            f"Unsupported image extension '.{ext}'. Supported: png, jpg, jpeg, gif, webp.",
            code="UNSUPPORTED_IMAGE_TYPE",
        )

    data = path.read_bytes()
    b64 = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{b64}"


@dataclass
class GenerateImageResult:
    mode: str
    warnings: list[str]
    response_id: str | None = None
    session_id: str | None = None
    saved_path: str | None = None
    revised_prompt: str | None = None
    request: dict[str, Any] | None = None
    response: dict[str, Any] | None = None

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "GenerateImageResult":
        mode = payload.get("mode")
        if not isinstance(mode, str):
            raise ValueError("Result payload is missing mode.")
        return cls(
            mode=mode,
            warnings=payload.get("warnings", []),
            response_id=payload.get("responseId"),
            session_id=payload.get("sessionId"),
            saved_path=payload.get("savedPath"),
            revised_prompt=payload.get("revisedPrompt"),
            request=payload.get("request"),
            response=payload.get("response"),
        )


class Client:
    def __init__(self, **overrides: Any):
        self.config = resolve_config(overrides)
        self.provider = create_private_codex_provider(self.config)

    def generate_image(
        self,
        *,
        prompt: str,
        model: str | None = None,
        output_path: str | None = None,
        image_paths: list[str] | str | None = None,
        size: str | None = None,
        dry_run: bool = False,
        debug: bool = False,
        debug_dir: str | None = None,
        client=None,
    ) -> GenerateImageResult:
        if image_paths is None:
            images = None
        elif isinstance(image_paths, str):
            images = [_image_path_to_data_url(image_paths)]
        else:
            images = [_image_path_to_data_url(p) for p in image_paths]
        payload = self.provider.generate_image(
            prompt=prompt,
            model=model or self.config["defaultModel"],
            output_path=output_path or self.config["defaultOutputPath"],
            images=images,
            size=size,
            dry_run=dry_run,
            debug=debug,
            debug_dir=debug_dir,
            client=client,
        )
        return GenerateImageResult.from_dict(payload)
