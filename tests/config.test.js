import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_IMAGE_MODEL, resolveConfig } from '../src/config.js';

test('resolveConfig defaults image model to gpt-image-2.5-sunburst', () => {
  const previous = process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
  delete process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
  try {
    const config = resolveConfig();
    assert.equal(DEFAULT_IMAGE_MODEL, 'gpt-image-2.5-sunburst');
    assert.equal(config.defaultImageModel, DEFAULT_IMAGE_MODEL);
  } finally {
    if (previous === undefined) {
      delete process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
    } else {
      process.env.CODEX_IMAGEGEN_IMAGE_MODEL = previous;
    }
  }
});

test('resolveConfig defaults the LLM model to gpt-5.6-sol', () => {
  const previousImageModel = process.env.CODEX_IMAGEGEN_MODEL;
  const previousCodexModel = process.env.CODEX_MODEL;
  delete process.env.CODEX_IMAGEGEN_MODEL;
  delete process.env.CODEX_MODEL;
  try {
    const config = resolveConfig();
    assert.equal(config.defaultModel, 'gpt-5.6-sol');
  } finally {
    for (const [key, previous] of [['CODEX_IMAGEGEN_MODEL', previousImageModel], ['CODEX_MODEL', previousCodexModel]]) {
      if (previous === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous;
      }
    }
  }
});

test('resolveConfig honors CODEX_IMAGEGEN_IMAGE_MODEL', () => {
  const previous = process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
  process.env.CODEX_IMAGEGEN_IMAGE_MODEL = 'gpt-image-2.5-sunburst';
  try {
    const config = resolveConfig();
    assert.equal(config.defaultImageModel, 'gpt-image-2.5-sunburst');
  } finally {
    if (previous === undefined) {
      delete process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
    } else {
      process.env.CODEX_IMAGEGEN_IMAGE_MODEL = previous;
    }
  }
});
