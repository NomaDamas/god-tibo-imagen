import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_IMAGE_MODEL, resolveConfig } from '../src/config.js';

test('resolveConfig defaults image model to gpt-image-2.5-flare', () => {
  const previous = process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
  delete process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
  try {
    const config = resolveConfig();
    assert.equal(DEFAULT_IMAGE_MODEL, 'gpt-image-2.5-flare');
    assert.equal(config.defaultImageModel, DEFAULT_IMAGE_MODEL);
  } finally {
    if (previous === undefined) {
      delete process.env.CODEX_IMAGEGEN_IMAGE_MODEL;
    } else {
      process.env.CODEX_IMAGEGEN_IMAGE_MODEL = previous;
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
