from __future__ import annotations

import json

import httpx
import pytest

from src.gti.client import Client
from .conftest import fixture_text, make_jwt


def test_client_generate_image_returns_result_dataclass(tmp_path):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": make_jwt({"exp": 32503680000}),
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    client = Client(authFile=str(auth_file), installationIdFile=str(installation_file), baseUrl="https://chatgpt.com/backend-api/codex")

    transport = httpx.MockTransport(
        lambda _: httpx.Response(200, headers={"content-type": "text/event-stream"}, text=fixture_text("success.sse"))
    )
    result = client.generate_image(
        prompt="blue square",
        output_path=str(tmp_path / "result.png"),
        client=httpx.Client(transport=transport),
    )

    assert result.mode == "live"
    assert result.response_id == "resp_success_1"
    assert result.saved_path is not None
    assert result.saved_path.endswith("result.png")


def test_client_generate_image_with_single_image_path(tmp_path):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": make_jwt({"exp": 32503680000}),
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    image_file = tmp_path / "input.png"
    image_file.write_bytes(b"fake-image-bytes")

    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        content = body["input"][0]["content"]
        assert len(content) == 2
        assert content[1]["type"] == "input_image"
        assert content[1]["image_url"] == "data:image/png;base64,ZmFrZS1pbWFnZS1ieXRlcw=="
        return httpx.Response(200, headers={"content-type": "text/event-stream"}, text=fixture_text("success.sse"))

    client = Client(authFile=str(auth_file), installationIdFile=str(installation_file), baseUrl="https://chatgpt.com/backend-api/codex")
    result = client.generate_image(
        prompt="blue square",
        output_path=str(tmp_path / "result.png"),
        image_paths=str(image_file),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    assert result.mode == "live"


def test_client_generate_image_with_multiple_image_paths(tmp_path):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": make_jwt({"exp": 32503680000}),
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    image_file_1 = tmp_path / "input1.png"
    image_file_1.write_bytes(b"fake-image-bytes-1")
    image_file_2 = tmp_path / "input2.png"
    image_file_2.write_bytes(b"fake-image-bytes-2")

    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        content = body["input"][0]["content"]
        assert len(content) == 3
        assert content[1]["type"] == "input_image"
        assert content[1]["image_url"] == "data:image/png;base64,ZmFrZS1pbWFnZS1ieXRlcy0x"
        assert content[2]["type"] == "input_image"
        assert content[2]["image_url"] == "data:image/png;base64,ZmFrZS1pbWFnZS1ieXRlcy0y"
        return httpx.Response(200, headers={"content-type": "text/event-stream"}, text=fixture_text("success.sse"))

    client = Client(authFile=str(auth_file), installationIdFile=str(installation_file), baseUrl="https://chatgpt.com/backend-api/codex")
    result = client.generate_image(
        prompt="blue square",
        output_path=str(tmp_path / "result.png"),
        image_paths=[str(image_file_1), str(image_file_2)],
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    assert result.mode == "live"


def test_client_generate_image_forwards_size(tmp_path):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": make_jwt({"exp": 32503680000}),
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        assert body["tools"][0]["size"] == "1536x1024"
        return httpx.Response(200, headers={"content-type": "text/event-stream"}, text=fixture_text("success.sse"))

    client = Client(authFile=str(auth_file), installationIdFile=str(installation_file), baseUrl="https://chatgpt.com/backend-api/codex")
    result = client.generate_image(
        prompt="blue square",
        output_path=str(tmp_path / "result.png"),
        size="1536x1024",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    assert result.mode == "live"


def test_client_generate_image_with_unsupported_extension(tmp_path):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": make_jwt({"exp": 32503680000}),
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    image_file = tmp_path / "input.bmp"
    image_file.write_bytes(b"fake-image-bytes")

    client = Client(authFile=str(auth_file), installationIdFile=str(installation_file), baseUrl="https://chatgpt.com/backend-api/codex")
    with pytest.raises(Exception) as exc_info:
        client.generate_image(
            prompt="blue square",
            output_path=str(tmp_path / "result.png"),
            image_paths=str(image_file),
        )
    assert "unsupported image extension" in str(exc_info.value).lower()


def test_client_generate_image_with_missing_file(tmp_path):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": make_jwt({"exp": 32503680000}),
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    client = Client(authFile=str(auth_file), installationIdFile=str(installation_file), baseUrl="https://chatgpt.com/backend-api/codex")
    with pytest.raises(Exception) as exc_info:
        client.generate_image(
            prompt="blue square",
            output_path=str(tmp_path / "result.png"),
            image_paths=str(tmp_path / "missing.png"),
        )
    assert "does not exist" in str(exc_info.value).lower() or "not found" in str(exc_info.value).lower()
