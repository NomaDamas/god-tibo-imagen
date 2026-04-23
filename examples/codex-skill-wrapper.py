#!/usr/bin/env python3
"""Codex skill wrapper for god-tibo-imagen.

A lightweight CLI wrapper around the god-tibo-imagen Python SDK designed
for invocation from Codex skills or direct command-line usage.

Example:
    python codex-skill-wrapper.py --prompt "flat blue square" --output ./out.png --dry-run
"""

from __future__ import annotations

import argparse
import json
import sys

from gti.client import Client


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate images via the god-tibo-imagen Python SDK."
    )
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument("--output", help="Output file path")
    parser.add_argument("--model", default="gpt-5.4", help="Model to use")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    parser.add_argument("--auth-file", help="Path to Codex auth.json")
    parser.add_argument(
        "--installation-id-file", help="Path to Codex installation_id file"
    )
    parser.add_argument(
        "--image",
        action="append",
        help="Input image path (can be used multiple times)",
    )
    parser.add_argument(
        "--debug", action="store_true", help="Enable debug output"
    )
    args = parser.parse_args()

    client_kwargs: dict[str, str] = {}
    if args.auth_file:
        client_kwargs["authFile"] = args.auth_file
    if args.installation_id_file:
        client_kwargs["installationIdFile"] = args.installation_id_file

    client = Client(**client_kwargs)

    gen_kwargs: dict[str, object] = {
        "prompt": args.prompt,
        "model": args.model,
        "dry_run": args.dry_run,
    }
    if args.output:
        gen_kwargs["output_path"] = args.output
    if args.image:
        gen_kwargs["image_paths"] = args.image
    if args.debug:
        gen_kwargs["debug"] = True

    result = client.generate_image(**gen_kwargs)

    print(json.dumps({
        "mode": result.mode,
        "savedPath": result.saved_path,
        "responseId": result.response_id,
        "sessionId": result.session_id,
        "revisedPrompt": result.revised_prompt,
        "warnings": result.warnings,
    }, indent=2))

    return 0


if __name__ == "__main__":
    sys.exit(main())
