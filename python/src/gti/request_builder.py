from __future__ import annotations

import uuid
from copy import deepcopy
from typing import Any

from .errors import make_error

REDACTED_ACCOUNT_ID = "[REDACTED_ACCOUNT_ID]"
REDACTED_SESSION_ID = "[REDACTED_SESSION_ID]"
REDACTED_INSTALLATION_ID = "[REDACTED_INSTALLATION_ID]"
REDACTED_IMAGE_URL = "[REDACTED_IMAGE_URL]"
SUPPORTED_IMAGE_SIZES = (
    "auto",
    "1024x1024",
    "1536x1024",
    "1024x1536",
    "2048x2048",
    "2048x1152",
    "3840x2160",
    "2160x3840",
)


def sanitize_headers(headers: dict[str, Any]) -> dict[str, Any]:
    clone = dict(headers)
    if clone.get("Authorization"):
        clone["Authorization"] = "Bearer [REDACTED]"
    if clone.get("ChatGPT-Account-ID"):
        clone["ChatGPT-Account-ID"] = REDACTED_ACCOUNT_ID
    if clone.get("session_id"):
        clone["session_id"] = REDACTED_SESSION_ID
    return clone


def sanitize_request_body(body: dict[str, Any]) -> dict[str, Any]:
    cloned = deepcopy(body)
    if cloned.get("client_metadata"):
        cloned["client_metadata"]["x-codex-installation-id"] = REDACTED_INSTALLATION_ID

    for msg in cloned.get("input", []):
        if not isinstance(msg, dict):
            continue
        for item in msg.get("content", []):
            if isinstance(item, dict) and item.get("type") == "input_image" and "image_url" in item:
                item["image_url"] = REDACTED_IMAGE_URL

    return cloned


def build_responses_request(
    *,
    base_url: str,
    session: dict[str, Any],
    prompt: str,
    model: str,
    originator: str,
    include_reasoning: bool = True,
    session_id: str | None = None,
    images: list[str] | None = None,
    size: str | None = None,
) -> dict[str, Any]:
    if not prompt or not prompt.strip():
        raise make_error("Prompt is required.")
    if size and size not in SUPPORTED_IMAGE_SIZES:
        supported = ", ".join(SUPPORTED_IMAGE_SIZES)
        raise make_error(f"Unsupported image size: {size}. Supported sizes: {supported}.")

    base = f"{base_url}/" if not base_url.endswith("/") else base_url
    url = f"{base}responses"
    session_id = session_id or str(uuid.uuid4())

    headers = {
        "Authorization": f"Bearer {session['accessToken']}",
        "ChatGPT-Account-ID": session["accountId"],
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "originator": originator,
        "session_id": session_id,
    }

    content: list[dict[str, Any]] = [{"type": "input_text", "text": prompt}]
    if images is not None:
        for image in images:
            content.append({"type": "input_image", "image_url": image})

    body = {
        "model": model,
        "instructions": "",
        "input": [
            {
                "type": "message",
                "role": "user",
                "content": content,
            }
        ],
        "tools": [
            {
                "type": "image_generation",
                "output_format": "png",
                **({"size": size} if size else {}),
            }
        ],
        "tool_choice": "auto",
        "parallel_tool_calls": False,
        "reasoning": None,
        "store": False,
        "stream": True,
        "include": ["reasoning.encrypted_content"] if include_reasoning else [],
        "client_metadata": (
            {"x-codex-installation-id": session["installationId"]} if session.get("installationId") else None
        ),
    }

    return {
        "url": url,
        "session_id": session_id,
        "sessionId": session_id,
        "headers": headers,
        "body": body,
        "sanitized": {
            "url": url,
            "headers": sanitize_headers(headers),
            "body": sanitize_request_body(body),
        },
    }
