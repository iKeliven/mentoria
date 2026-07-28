import test from 'node:test';
import assert from 'node:assert/strict';
import { vectorToString } from '../src/utils/rag.js';

test('vectorToString serializa valores para o formato do pgvector', () => {
  assert.equal(vectorToString([0.1, 0.2, 0.3]), '[0.1,0.2,0.3]');
});
