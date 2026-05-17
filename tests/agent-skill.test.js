import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const skillDir = path.join(rootDir, 'skills', 'god-tibo-imagen');
const wrapperPath = path.join(skillDir, 'scripts', 'wrapper.py');
const skillMdPath = path.join(skillDir, 'SKILL.md');
const skillReadmePath = path.join(skillDir, 'README.md');
const openaiYamlPath = path.join(skillDir, 'agents', 'openai.yaml');

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const front = match[1];
  const body = match[2];
  const meta = {};
  for (const line of front.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value.replace(/^["']|["']$/g, '');
  }
  return { meta, body };
}

test('agent-skill wrapper script exists at scripts/wrapper.py', async () => {
  assert.equal(await fileExists(wrapperPath), true, 'wrapper script should exist');
});

test('agent-skill wrapper script is valid Python', async () => {
  const content = await fs.readFile(wrapperPath, 'utf8');
  assert.ok(content.includes('def main('), 'wrapper should define a main function');
  assert.ok(content.includes('if __name__ == "__main__":'), 'wrapper should have __main__ guard');
  assert.ok(
    content.includes('import argparse') || content.includes('from gti'),
    'wrapper should import required modules'
  );
});

test('agent-skill SKILL.md exists with valid frontmatter', async () => {
  assert.equal(await fileExists(skillMdPath), true, 'SKILL.md should exist');
  const content = await fs.readFile(skillMdPath, 'utf8');
  const parsed = parseYamlFrontmatter(content);
  assert.ok(parsed, 'SKILL.md should have YAML frontmatter');
  assert.ok(parsed.meta.name, 'frontmatter should have a name');
  assert.ok(parsed.meta.description, 'frontmatter should have a description');
  assert.ok(parsed.body.includes('#'), 'SKILL.md body should contain markdown headers');
  assert.equal(parsed.meta.name, 'god-tibo-imagen', 'name must match parent directory (agentskills.io spec)');
  assert.match(parsed.meta.name, /^[a-z0-9]+(-[a-z0-9]+)*$/, 'name must be lowercase + hyphens only');
});

test('agent-skill README.md exists for human-facing docs', async () => {
  assert.equal(await fileExists(skillReadmePath), true, 'README.md should exist');
  const content = await fs.readFile(skillReadmePath, 'utf8');
  assert.ok(content.toLowerCase().includes('agent skill'), 'README should describe this as an Agent Skill');
});

test('agent-skill agents/openai.yaml exists and is valid', async () => {
  assert.equal(await fileExists(openaiYamlPath), true, 'agents/openai.yaml should exist');
  const content = await fs.readFile(openaiYamlPath, 'utf8');
  assert.ok(content.includes('interface:'), 'openai.yaml should have interface section');
  assert.ok(content.includes('display_name:'), 'openai.yaml should have display_name');
  assert.ok(
    content.includes('allow_implicit_invocation: false'),
    'skill should not be implicitly invoked for generic image requests'
  );
  for (const match of content.matchAll(/:\s*["']?(\.\/[^"'\n]+)["']?/g)) {
    const referencedPath = path.join(skillDir, match[1]);
    assert.equal(await fileExists(referencedPath), true, `${match[1]} should exist`);
  }
});

test('README.md references the agent-skill example by new path', async () => {
  const readmePath = path.join(rootDir, 'README.md');
  const content = await fs.readFile(readmePath, 'utf8');
  assert.ok(
    content.includes('skills/god-tibo-imagen'),
    'root README should reference skills/god-tibo-imagen'
  );
});

test('no leftover legacy codex-skill paths exist under examples/', async () => {
  const legacyDir = path.join(rootDir, 'examples', 'codex-skill');
  const legacyWrapper = path.join(rootDir, 'examples', 'codex-skill-wrapper.py');
  assert.equal(
    await fileExists(legacyDir),
    false,
    'examples/codex-skill/ should have been removed in favor of skills/god-tibo-imagen/'
  );
  assert.equal(
    await fileExists(legacyWrapper),
    false,
    'examples/codex-skill-wrapper.py should have been moved to skills/god-tibo-imagen/scripts/wrapper.py'
  );
});
