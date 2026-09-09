from __future__ import annotations

import os
from pathlib import Path
from time import time

PRIVATE_CODEX_PROVIDER = "private-codex"
CODEX_CLI_PROVIDER = "codex-cli"
AUTO_PROVIDER = "auto"
SUPPORTED_PROVIDERS = [PRIVATE_CODEX_PROVIDER, CODEX_CLI_PROVIDER, AUTO_PROVIDER]

UNSUPPORTED_WARNING = (
    "WARNING: This project calls an unsupported private Codex backend path. "
    "The contract may break without notice."
)
DEFAULT_IMAGE_MODEL = "gpt-image-2.5-flare"


def resolve_config(overrides: dict | None = None) -> dict[str, str]:
    overrides = overrides or {}
    codex_home = overrides.get("codexHome") or os.environ.get("CODEX_HOME") or str(Path.home() / ".codex")
    base_url = (
        overrides.get("baseUrl")
        or os.environ.get("CODEX_IMAGEGEN_BASE_URL")
        or "https://chatgpt.com/backend-api/codex"
    )
    auth_file = (
        overrides.get("authFile")
        or os.environ.get("CODEX_IMAGEGEN_AUTH_FILE")
        or str(Path(codex_home) / "auth.json")
    )
    installation_id_file = (
        overrides.get("installationIdFile")
        or os.environ.get("CODEX_IMAGEGEN_INSTALLATION_ID_FILE")
        or str(Path(codex_home) / "installation_id")
    )
    generated_images_dir = (
        overrides.get("generatedImagesDir")
        or os.environ.get("CODEX_IMAGEGEN_GENERATED_IMAGES_DIR")
        or str(Path(codex_home) / "generated_images")
    )

    return {
        "baseUrl": base_url,
        "codexHome": codex_home,
        "authFile": auth_file,
        "installationIdFile": installation_id_file,
        "generatedImagesDir": generated_images_dir,
        "provider": overrides.get("provider") or os.environ.get("CODEX_IMAGEGEN_PROVIDER") or PRIVATE_CODEX_PROVIDER,
        "defaultModel": (
            overrides.get("defaultModel")
            or os.environ.get("CODEX_IMAGEGEN_MODEL")
            or os.environ.get("CODEX_MODEL")
            or "gpt-5.4"
        ),
        "defaultImageModel": (
            overrides.get("defaultImageModel")
            or os.environ.get("CODEX_IMAGEGEN_IMAGE_MODEL")
            or DEFAULT_IMAGE_MODEL
        ),
        "defaultOriginator": (
            overrides.get("originator")
            or os.environ.get("CODEX_IMAGEGEN_ORIGINATOR")
            or os.environ.get("CODEX_INTERNAL_ORIGINATOR_OVERRIDE")
            or "codex_cli_rs"
        ),
        "defaultOutputPath": (
            overrides.get("defaultOutputPath")
            or os.environ.get("CODEX_IMAGEGEN_OUTPUT")
            or str(Path.cwd() / f"generated-{int(time() * 1000)}.png")
        ),
    }
