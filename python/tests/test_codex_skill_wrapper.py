from __future__ import annotations

import json
import runpy
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

EXAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "examples"
WRAPPER_PATH = EXAMPLES_DIR / "codex-skill-wrapper.py"
SKILL_DIR = EXAMPLES_DIR / "codex-skill"


def test_wrapper_script_exists():
    assert WRAPPER_PATH.exists(), "codex-skill-wrapper.py should exist"


def test_skill_directory_exists():
    assert SKILL_DIR.exists(), "codex-skill directory should exist"
    assert (SKILL_DIR / "SKILL.md").exists(), "SKILL.md should exist"
    assert (SKILL_DIR / "agents" / "openai.yaml").exists(), "agents/openai.yaml should exist"


def test_wrapper_has_main_function():
    source = WRAPPER_PATH.read_text(encoding="utf-8")
    assert "def main(" in source, "wrapper should define a main function"
    assert 'if __name__ == "__main__":' in source, "wrapper should have __main__ guard"


def test_wrapper_imports_gti():
    source = WRAPPER_PATH.read_text(encoding="utf-8")
    assert "from gti.client import Client" in source or "from gti import Client" in source or "import gti" in source, "wrapper should import gti"


def test_wrapper_dry_run_does_not_require_auth(tmp_path, monkeypatch):
    auth_file = tmp_path / "auth.json"
    installation_file = tmp_path / "installation_id"
    auth_file.write_text(
        json.dumps(
            {
                "auth_mode": "chatgpt",
                "tokens": {
                    "access_token": "fake-token",
                    "account_id": "acct-123",
                },
            }
        ),
        encoding="utf-8",
    )
    installation_file.write_text("iid-123", encoding="utf-8")

    output_file = tmp_path / "output.png"

    test_args = [
        str(WRAPPER_PATH),
        "--prompt",
        "blue square",
        "--output",
        str(output_file),
        "--dry-run",
        "--auth-file",
        str(auth_file),
        "--installation-id-file",
        str(installation_file),
    ]
    monkeypatch.setattr(sys, "argv", test_args)

    with patch("gti.client.create_private_codex_provider") as mock_provider:
        mock_instance = mock_provider.return_value
        mock_instance.generate_image.return_value = {
            "mode": "dry-run",
            "warnings": [],
            "responseId": "dry-run-123",
            "savedPath": str(output_file),
            "request": {},
            "response": {},
        }

        with pytest.raises(SystemExit) as exc_info:
            runpy.run_path(str(WRAPPER_PATH), run_name="__main__")
        assert exc_info.value.code == 0, "wrapper should exit with code 0 on success"


def test_wrapper_skills_md_has_valid_frontmatter():
    skill_md = SKILL_DIR / "SKILL.md"
    content = skill_md.read_text(encoding="utf-8")
    assert content.startswith("---\n"), "SKILL.md should start with YAML frontmatter delimiter"
    assert "name:" in content, "SKILL.md should have a name field"
    assert "description:" in content, "SKILL.md should have a description field"
    assert "# " in content, "SKILL.md should contain markdown headers"
