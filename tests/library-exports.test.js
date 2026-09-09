import test from 'node:test';
import assert from 'node:assert/strict';

import * as api from '../src/index.js';

const expectedExports = [
  'loadCodexSession',
  'validateCodexSession',
  'resolveConfig',
  'DEFAULT_IMAGE_MODEL',
  'UNSUPPORTED_WARNING',
  'buildResponsesRequest',
  'sanitizeHeaders',
  'sanitizeRequestBody',
  'parseSseText',
  'summarizeEvents',
  'extractImageGeneration',
  'saveImage',
  'createProvider',
  'createPrivateCodexProvider',
  'createCodexCliProvider',
  'PRIVATE_CODEX_PROVIDER',
  'CODEX_CLI_PROVIDER',
  'AUTO_PROVIDER',
  'SUPPORTED_PROVIDERS',
  'REDACTED_ACCOUNT_ID',
  'REDACTED_SESSION_ID',
  'REDACTED_INSTALLATION_ID'
];

test('library entrypoint exposes public API', () => {
  for (const name of expectedExports) {
    assert.ok(name in api, `missing export: ${name}`);
  }

  assert.equal(typeof api.createProvider, 'function');
  assert.equal(typeof api.resolveConfig, 'function');
  assert.equal(api.DEFAULT_IMAGE_MODEL, 'gpt-image-2.5-flare');
  assert.equal(api.SUPPORTED_PROVIDERS.includes(api.AUTO_PROVIDER), true);
});
