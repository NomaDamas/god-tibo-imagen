from __future__ import annotations

import pytest

from src.gti.request_builder import (
    REDACTED_ACCOUNT_ID,
    REDACTED_INSTALLATION_ID,
    REDACTED_SESSION_ID,
    build_responses_request,
)


def test_build_responses_request_matches_shape():
    session = {"accessToken": "token-1", "accountId": "acct-1", "installationId": "iid-1"}
    result = build_responses_request(
        base_url="https://chatgpt.com/backend-api/codex",
        session=session,
        prompt="flat blue square icon",
        model="gpt-5.4",
        originator="codex_cli_rs",
        session_id="session-123",
    )

    assert result["url"] == "https://chatgpt.com/backend-api/codex/responses"
    assert result["sessionId"] == "session-123"
    assert result["headers"]["Authorization"] == "Bearer token-1"
    assert result["body"]["include"] == ["reasoning.encrypted_content"]
    assert result["sanitized"]["headers"]["Authorization"] == "Bearer [REDACTED]"
    assert result["sanitized"]["headers"]["ChatGPT-Account-ID"] == REDACTED_ACCOUNT_ID
    assert result["sanitized"]["headers"]["session_id"] == REDACTED_SESSION_ID
    assert result["sanitized"]["body"]["client_metadata"]["x-codex-installation-id"] == REDACTED_INSTALLATION_ID


def test_build_responses_request_requires_prompt():
    with pytest.raises(Exception) as exc_info:
        build_responses_request(
            base_url="https://example.com",
            session={"accessToken": "a", "accountId": "b"},
            prompt="   ",
            model="gpt-5.4",
            originator="orig",
        )
    assert str(exc_info.value) == "Prompt is required."


def test_build_responses_request_includes_input_image_when_images_provided():
    session = {"accessToken": "token-1", "accountId": "acct-1"}
    result = build_responses_request(
        base_url="https://chatgpt.com/backend-api/codex",
        session=session,
        prompt="make this blue",
        model="gpt-5.4",
        originator="codex_cli_rs",
        images=["data:image/png;base64,abc123", "data:image/png;base64,def456"],
    )

    content = result["body"]["input"][0]["content"]
    assert len(content) == 3
    assert content[0] == {"type": "input_text", "text": "make this blue"}
    assert content[1] == {"type": "input_image", "image_url": "data:image/png;base64,abc123"}
    assert content[2] == {"type": "input_image", "image_url": "data:image/png;base64,def456"}


def test_build_responses_request_forwards_size_to_tool_config():
    session = {"accessToken": "token-1", "accountId": "acct-1"}
    result = build_responses_request(
        base_url="https://chatgpt.com/backend-api/codex",
        session=session,
        prompt="make this blue",
        model="gpt-5.4",
        originator="codex_cli_rs",
        size="1536x1024",
    )

    assert result["body"]["tools"] == [
        {
            "type": "image_generation",
            "output_format": "png",
            "size": "1536x1024",
        }
    ]


def test_build_responses_request_rejects_unsupported_size():
    with pytest.raises(Exception) as exc_info:
        build_responses_request(
            base_url="https://example.com",
            session={"accessToken": "a", "accountId": "b"},
            prompt="flat blue square",
            model="gpt-5.4",
            originator="orig",
            size="999x999",
        )

    message = str(exc_info.value)
    assert "Unsupported image size: 999x999" in message
    assert "1536x1024" in message


def test_build_responses_request_omits_input_image_when_images_none():
    session = {"accessToken": "token-1", "accountId": "acct-1"}
    result = build_responses_request(
        base_url="https://chatgpt.com/backend-api/codex",
        session=session,
        prompt="make this blue",
        model="gpt-5.4",
        originator="codex_cli_rs",
    )

    content = result["body"]["input"][0]["content"]
    assert len(content) == 1
    assert content[0] == {"type": "input_text", "text": "make this blue"}


def test_build_responses_request_sanitizes_input_image_url():
    session = {"accessToken": "token-1", "accountId": "acct-1"}
    result = build_responses_request(
        base_url="https://chatgpt.com/backend-api/codex",
        session=session,
        prompt="make this blue",
        model="gpt-5.4",
        originator="codex_cli_rs",
        images=["data:image/png;base64,secret"],
    )

    sanitized_content = result["sanitized"]["body"]["input"][0]["content"]
    assert sanitized_content[1]["image_url"] == "[REDACTED_IMAGE_URL]"
