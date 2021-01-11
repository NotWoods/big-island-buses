import test from 'ava';
import { readFile } from 'fs/promises';
import JSZip from 'jszip';
import { zipFilesToObject } from './parse.js';

test('zipFilesToObject', async (t) => {
  const buffer = await readFile('google_transit.zip');
  const zip = await JSZip.loadAsync(buffer);
  const input = new Map(
    Object.entries({
      routes: zip.file('routes.txt')!,
    }),
  );
  const result = await zipFilesToObject(input);

  t.deepEqual(Object.keys(result), ['routes']);
  t.not(result.routes.length, 0);

  const expectedKeys = [
    'route_id',
    'route_short_name',
    'route_long_name',
    'route_desc',
    'route_type',
    'route_url',
    'route_color',
    'route_text_color',
    'route_sort_order',
  ];
  for (const route of result.routes) {
    t.false(Array.isArray(route));
    t.deepEqual(Object.keys(route), expectedKeys);
  }
});
