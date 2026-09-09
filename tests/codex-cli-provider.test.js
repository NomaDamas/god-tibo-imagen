import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { createCodexCliProvider, codexCliProviderInternals } from '../src/providers/codexCliProvider.js';
import { makeTempDir, PNG_BASE64 } from './helpers.js';

test('extractSessionId parses Codex CLI stdout', () => {
  const sessionId = codexCliProviderInternals.extractSessionId('session id: 019db407-7ba4-7643-8f14-47011c0e1dc1');
  assert.equal(sessionId, '019db407-7ba4-7643-8f14-47011c0e1dc1');
});

test('codex-cli provider verifies generated image and copies it', async () => {
  const dir = await makeTempDir();
  const generatedImagesDir = path.join(dir, 'generated_images');
  const sessionId = '019db407-7ba4-7643-8f14-47011c0e1dc1';
  const sourceDir = path.join(generatedImagesDir, sessionId);
  const sourcePath = path.join(sourceDir, 'ig_test.png');
  const outputPath = path.join(dir, 'copied.png');
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(sourcePath, Buffer.from(PNG_BASE64, 'base64'));

  const calls = [];
  const execImpl = async (file, args) => {
    calls.push([file, args]);
    if (args[0] === '--version') {
      return { stdout: 'codex-cli 0.122.0\n', stderr: '' };
    }
    if (args[0] === 'login') {
      return { stdout: 'Logged in using ChatGPT\n', stderr: '' };
    }
    return {
      stdout: `OpenAI Codex\nsession id: ${sessionId}\n`,
      stderr: ''
    };
  };

  const provider = createCodexCliProvider({ generatedImagesDir });
  const result = await provider.generateImage({
    prompt: 'red square',
    outputPath,
    execImpl
  });

  assert.equal(result.provider, 'codex-cli');
  assert.equal(result.sessionId, sessionId);
  assert.equal(result.response.generatedSourcePath, sourcePath);
  const bytes = await fs.readFile(outputPath);
  assert.ok(bytes.length > 10);
  assert.equal(calls.length, 3);
});

test('codex-cli provider writes debug summary without raw image payloads', async () => {
  const dir = await makeTempDir();
  const generatedImagesDir = path.join(dir, 'generated_images');
  const sessionId = '019db407-7ba4-7643-8f14-47011c0e1dc1';
  const sourceDir = path.join(generatedImagesDir, sessionId);
  const sourcePath = path.join(sourceDir, 'ig_test.png');
  const outputPath = path.join(dir, 'copied.png');
  const debugDir = path.join(dir, '.debug');
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(sourcePath, Buffer.from(PNG_BASE64, 'base64'));

  const execImpl = async (_file, args) => {
    if (args[0] === '--version') {
      return { stdout: 'codex-cli 0.122.0\n', stderr: '' };
    }
    if (args[0] === 'login') {
      return { stdout: 'Logged in using ChatGPT\n', stderr: '' };
    }
    return {
      stdout: `session id: ${sessionId}\n`,
      stderr: 'bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted\n'
    };
  };

  const provider = createCodexCliProvider({ generatedImagesDir });
  await provider.generateImage({
    prompt: 'red square',
    outputPath,
    debug: true,
    debugDir,
    execImpl
  });

  const dump = JSON.parse(await fs.readFile(path.join(debugDir, 'codex-cli-run.json'), 'utf8'));
  assert.equal(dump.provider, 'codex-cli');
  assert.equal(dump.sessionId, sessionId);
  assert.match(dump.warnings[0], /sandbox\/bwrap/);
  assert.equal(dump.command.args.at(-1), '[PROMPT_REDACTED]');
});

test('codex-cli provider throws when imageModel is provided', async () => {
  const dir = await makeTempDir();
  const generatedImagesDir = path.join(dir, 'generated_images');
  const provider = createCodexCliProvider({ generatedImagesDir });

  await assert.rejects(
    async () =>
      provider.generateImage({
        prompt: 'red square',
        outputPath: path.join(dir, 'out.png'),
        imageModel: 'gpt-image-2.5-flare'
      }),
    /does not support image model selection/
  );
});

test('codex-cli provider throws when images are provided', async () => {
  const dir = await makeTempDir();
  const generatedImagesDir = path.join(dir, 'generated_images');
  const provider = createCodexCliProvider({ generatedImagesDir });

  await assert.rejects(
    async () =>
      provider.generateImage({
        prompt: 'red square',
        outputPath: path.join(dir, 'out.png'),
        images: ['data:image/png;base64,abc123']
      }),
    /does not support image input/
  );
});
