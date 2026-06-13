import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const cliPath = path.join(rootDir, 'src', 'cli', 'generate.js');
const versionPath = path.join(rootDir, 'VERSION');

async function runCli(args) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, ...args]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

test('gti --version prints the VERSION file value and exits 0', async () => {
  const expected = (await fs.readFile(versionPath, 'utf8')).trim();
  const result = await runCli(['--version']);
  assert.equal(result.code, 0, `expected exit 0, got ${result.code}; stderr: ${result.stderr}`);
  assert.ok(
    result.stdout.includes(expected),
    `stdout "${result.stdout.trim()}" should include version "${expected}"`
  );
});

test('gti -v is an alias for --version', async () => {
  const expected = (await fs.readFile(versionPath, 'utf8')).trim();
  const result = await runCli(['-v']);
  assert.equal(result.code, 0, `expected exit 0, got ${result.code}; stderr: ${result.stderr}`);
  assert.ok(
    result.stdout.includes(expected),
    `stdout "${result.stdout.trim()}" should include version "${expected}"`
  );
});

test('gti --version does not require a prompt', async () => {
  const result = await runCli(['--version']);
  assert.equal(result.code, 0, 'version should short-circuit before the prompt requirement');
});
