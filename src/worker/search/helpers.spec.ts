import test from 'ava';

test('applyOffset', async (t) => {
  const { applyOffset } = await import('./helpers.js')
  t.is(applyOffset('Google abc', 3), 'Goo abc');
  t.is(applyOffset('Google abc', 8), 'Google a');

  t.is(applyOffset('Google abc', 10), 'Google abc');
  t.is(applyOffset('Google abc', 6), 'Google abc');

  t.is(applyOffset('Google abc', 0), ' abc');
  t.is(applyOffset('Google abc', 7), 'Google ');
});
