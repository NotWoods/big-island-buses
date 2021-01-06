import test from 'ava';
import { applyOffset } from './helpers.js';

test('applyOffset', async (t) => {
  t.is(applyOffset('Google abc', 3), 'Goo abc');
  t.is(applyOffset('Google abc', 8), 'Google a');

  t.is(applyOffset('Google abc', 10), 'Google abc');
  t.is(applyOffset('Google abc', 6), 'Google abc');

  t.is(applyOffset('Google abc', 0), ' abc');
  t.is(applyOffset('Google abc', 7), 'Google ');
});
