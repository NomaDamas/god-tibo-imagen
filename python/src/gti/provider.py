from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import httpx

from .auth import load_codex_session, validate_codex_session
from .extract import extract_image_generation
from .request_builder import sanitize_headers, sanitize_request_body, build_responses_request
from .save import save_image
from .sse_parser import parse_sse_text
from .errors import make_error


def _classify_failure(*, status: int, body: str):
    if status == 401:
        return make_error(
            "Unauthorized from private Codex backend. Your local ChatGPT auth may be expired.",
            code="UNAUTHORIZED",
            status=status,
            body=body,
        )
    return make_error(
        f"Private Codex backend request failed with HTTP {status}.",
        code="HTTP_ERROR",
        status=status,
        body=body,
    )


def _redact_secrets(value: Any) -> str:
    text = str(value or "")
    patterns = [
        (r"Bearer\s+[A-Za-z0-9._-]+", "Bearer [REDACTED]"),
        (r'"ChatGPT-Account-ID":"[^"]+"', '"ChatGPT-Account-ID":"[REDACTED_ACCOUNT_ID]"'),
        (r'"session_id":"[^"]+"', '"session_id":"[REDACTED_SESSION_ID]"'),
        (r'"x-codex-installation-id":"[^"]+"', '"x-codex-installation-id":"[REDACTED_INSTALLATION_ID]"'),
        (r'"partial_image_b64":"[^"]+"', '"partial_image_b64":"[REDACTED_IMAGE_B64]"'),
        (r'"result":"[^"]+"', '"result":"[REDACTED_IMAGE_B64]"'),
        (r'"image_url":"[^"]+"', '"image_url":"[REDACTED_IMAGE_URL]"'),
    ]
    for pattern, replacement in patterns:
        text = re.sub(pattern, replacement, text)
    return text


SAFE_RESPONSE_HEADERS = {
    "content-type",
    "x-oai-request-id",
    "x-codex-plan-type",
    "x-codex-active-limit",
    "x-models-etag",
}


def _sanitize_response_headers(headers: dict[str, str]) -> dict[str, str]:
    return {key: value for key, value in headers.items() if key.lower() in SAFE_RESPONSE_HEADERS}


def _summarize_event_counts(events: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for event in events:
        data = event.get("data") if isinstance(event, dict) else None
        key = (data or {}).get("type") or event.get("event") or "unknown"
        counts[key] = counts.get(key, 0) + 1
    return counts


def _summarize_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "type": item.get("type", "unknown"),
            "status": item.get("status"),
            "hasResult": bool(item.get("result")),
            "hasRevisedPrompt": bool(item.get("revised_prompt")),
            "role": item.get("role"),
        }
        for item in items
    ]


def _build_debug_response_body(*, parsed: dict[str, Any] | None, response_body: str) -> dict[str, Any]:
    if not parsed:
        return {"format": "unparsed", "body": _redact_secrets(response_body)}
    return {
        "format": "sse" if len(parsed["events"]) > 0 else "json",
        "responseIdPresent": bool(parsed.get("responseId")),
        "eventCounts": _summarize_event_counts(parsed["events"]),
        "items": _summarize_items(parsed["items"]),
    }


def _write_debug_artifacts(
    *,
    debug_dir: str | Path | None,
    request: dict[str, Any],
    response_status: int,
    response_headers: dict[str, str],
    response_body: str,
    parsed: dict[str, Any] | None = None,
) -> None:
    if not debug_dir:
        return
    directory = Path(debug_dir)
    directory.mkdir(parents=True, exist_ok=True)
    request_dump = {
        "url": request["url"],
        "headers": sanitize_headers(request["headers"]),
        "body": sanitize_request_body(request["body"]),
    }
    (directory / "request.json").write_text(json.dumps(request_dump, indent=2), encoding="utf-8")

    response_dump = {
        "status": response_status,
        "headers": _sanitize_response_headers(response_headers),
        "body": _build_debug_response_body(parsed=parsed, response_body=response_body),
    }
    (directory / "response.json").write_text(json.dumps(response_dump, indent=2), encoding="utf-8")


class PrivateCodexProvider:
    def __init__(self, config: dict[str, Any]):
        self.config = config

    def generate_image(
        self,
        *,
        prompt: str,
        model: str,
        output_path: str,
        images: list[str] | None = None,
        size: str | None = None,
        dry_run: bool = False,
        debug: bool = False,
        debug_dir: str | Path | None = None,
        client: httpx.Client | None = None,
    ) -> dict[str, Any]:
        session = load_codex_session(
            auth_file=self.config["authFile"], installation_id_file=self.config["installationIdFile"]
        )
        validation = validate_codex_session(session)
        request = build_responses_request(
            base_url=self.config["baseUrl"],
            session=session,
            prompt=prompt,
            model=model,
            originator=self.config["defaultOriginator"],
            images=images,
            size=size,
        )

        if dry_run:
            return {"mode": "dry-run", "warnings": validation["warnings"], "request": request["sanitized"]}

        owns_client = client is None
        client = client or httpx.Client(timeout=300.0)
        try:
            response = client.post(request["url"], headers=request["headers"], json=request["body"])
        finally:
            if owns_client:
                client.close()

        response_headers = dict(response.headers)
        content_type = response.headers.get("content-type", "")

        if response.status_code < 200 or response.status_code >= 300:
            failure_text = response.text
            if debug:
                _write_debug_artifacts(
                    debug_dir=debug_dir,
                    request=request,
                    response_status=response.status_code,
                    response_headers=response_headers,
                    response_body=failure_text,
                )
            raise _classify_failure(status=response.status_code, body=failure_text)

        response_body_for_debug = response.text
        try:
            trimmed = response_body_for_debug.lstrip()
            should_parse_as_sse = (
                "text/event-stream" in content_type or trimmed.startswith("event:") or trimmed.startswith("data:")
            )
            if should_parse_as_sse:
                parsed = parse_sse_text(response_body_for_debug)
            else:
                payload = json.loads(response_body_for_debug)
                parsed = {
                    "events": [],
                    "items": payload.get("output") if isinstance(payload.get("output"), list) else [],
                    "responseId": payload.get("id"),
                }
        except Exception:
            if debug:
                _write_debug_artifacts(
                    debug_dir=debug_dir,
                    request=request,
                    response_status=response.status_code,
                    response_headers=response_headers,
                    response_body=response_body_for_debug,
                )
            raise

        if debug:
            _write_debug_artifacts(
                debug_dir=debug_dir,
                request=request,
                response_status=response.status_code,
                response_headers=response_headers,
                response_body=response_body_for_debug,
                parsed=parsed,
            )

        image = extract_image_generation(parsed)
        saved_path = save_image(result_base64=image["resultBase64"], output_path=output_path)
        return {
            "mode": "live",
            "warnings": validation["warnings"],
            "responseId": parsed["responseId"],
            "sessionId": request["sessionId"],
            "savedPath": saved_path,
            "revisedPrompt": image["revisedPrompt"],
            "request": request["sanitized"],
            "response": {
                "status": response.status_code,
                "headers": response_headers,
                "itemCount": len(parsed["items"]),
            },
        }


def create_private_codex_provider(config: dict[str, Any]) -> PrivateCodexProvider:
    return PrivateCodexProvider(config)
