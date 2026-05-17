from __future__ import annotations

import json
import runpy
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SKILL_DIR = REPO_ROOT / "skills" / "god-tibo-imagen"
WRAPPER_PATH = SKILL_DIR / "scripts" / "wrapper.py"
SKILL_MD_PATH = SKILL_DIR / "SKILL.md"
OPENAI_YAML_PATH = SKILL_DIR / "agents" / "openai.yaml"
SKILL_README_PATH = SKILL_DIR / "README.md"


def test_wrapper_script_exists():
    assert WRAPPER_PATH.exists(), "skills/god-tibo-imagen/scripts/wrapper.py should exist"


def test_skill_directory_exists():
    assert SKILL_DIR.exists(), "skills/god-tibo-imagen directory should exist"
    assert SKILL_MD_PATH.exists(), "SKILL.md should exist"
    assert OPENAI_YAML_PATH.exists(), "agents/openai.yaml should exist"
    assert SKILL_README_PATH.exists(), "README.md should exist"


def test_legacy_codex_skill_paths_removed():
    legacy_dir = REPO_ROOT / "examples" / "codex-skill"
    legacy_wrapper = REPO_ROOT / "examples" / "codex-skill-wrapper.py"
    assert not legacy_dir.exists(), (
        "examples/codex-skill/ must be removed in favor of skills/god-tibo-imagen/"
    )
    assert not legacy_wrapper.exists(), (
        "examples/codex-skill-wrapper.py must be moved to skills/god-tibo-imagen/scripts/wrapper.py"
    )


def test_wrapper_has_main_function():
    source = WRAPPER_PATH.read_text(encoding="utf-8")
    assert "def main(" in source, "wrapper should define a main function"
    assert 'if __name__ == "__main__":' in source, "wrapper should have __main__ guard"


def test_wrapper_imports_gti():
    source = WRAPPER_PATH.read_text(encoding="utf-8")
    assert (
        "from gti.client import Client" in source
        or "from gti import Client" in source
        or "import gti" in source
    ), "wrapper should import gti"


def test_wrapper_dry_run_does_not_require_auth(tmp_path, monkeypatch, capsys):
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
        output = json.loads(capsys.readouterr().out)
        assert output["mode"] == "dry-run"
        assert output["request"] == {}
        assert output["response"] == {}


def test_skill_md_has_valid_frontmatter():
    content = SKILL_MD_PATH.read_text(encoding="utf-8")
    assert content.startswith("---\n"), "SKILL.md should start with YAML frontmatter delimiter"
    assert "name: god-tibo-imagen" in content, "SKILL.md name must match parent directory"
    assert "description:" in content, "SKILL.md should have a description field"
    assert "argument-hint" not in content, (
        "argument-hint is Codex-specific and not in the cross-agent agentskills.io spec"
    )
    assert "# " in content, "SKILL.md should contain markdown headers"


def test_openai_yaml_disables_broad_implicit_invocation():
    content = OPENAI_YAML_PATH.read_text(encoding="utf-8")
    assert "allow_implicit_invocation: false" in content
