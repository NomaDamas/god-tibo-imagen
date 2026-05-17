# god-tibo-imagen — Agent Skill

Cross-agent Agent Skill that wraps the `god-tibo-imagen` Python SDK / Node.js
CLI for image generation via Codex's private ChatGPT-authenticated backend.

This skill follows the [Agent Skills](https://agentskills.io/specification)
format and is compatible with any coding agent that supports it (Claude Code,
Codex, Cursor, OpenCode, Continue, Gemini CLI, etc.).

## Layout

```
skills/god-tibo-imagen/
├── SKILL.md              # Agent-facing skill definition (YAML frontmatter + body)
├── README.md             # This file (installation + usage notes for humans)
├── scripts/
│   └── wrapper.py        # argparse wrapper around the `gti` Python SDK
└── agents/
    └── openai.yaml       # Optional Codex/OpenAI interface descriptor
```

## Prerequisites

- Python 3.10+
- `pip install god-tibo-imagen` (the import name is `gti`)
- Existing Codex ChatGPT auth state in `~/.codex/auth.json`
  (`auth_mode = chatgpt`)

## Installation

Copy or symlink this directory into your agent's skills path.

### Vercel `skills` CLI (recommended for any supported agent)

```bash
npx skills add NomaDamas/god-tibo-imagen --skill god-tibo-imagen
```

### Manual installation by agent

| Agent          | Target path                                         |
|----------------|-----------------------------------------------------|
| Claude Code    | `.claude/skills/god-tibo-imagen/`                   |
| Codex          | `~/.codex/skills/god-tibo-imagen/` (or project `.agents/skills/`) |
| OpenCode       | `~/.config/opencode/skills/god-tibo-imagen/`        |
| Cursor / Continue / Gemini CLI / Kiro | `.agents/skills/god-tibo-imagen/` (project) |

For example, on macOS to install for Claude Code from this repo:

```bash
cp -R skills/god-tibo-imagen ~/.claude/skills/
```

## Verifying

```bash
python skills/god-tibo-imagen/scripts/wrapper.py \
  --prompt "flat blue square icon" \
  --output ./test.png \
  --dry-run
```

A successful dry run prints a JSON payload with `"mode": "dry-run"` and does
not perform a live network call.

## License

Same as the parent repository.
