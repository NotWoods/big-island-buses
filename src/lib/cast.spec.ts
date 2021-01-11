import test from 'ava';
import { readFile } from 'fs/promises';
import parse from 'csv-parse';
import JSZip from 'jszip';
import { cast } from './cast.js';

async function* loadZipFile(path: string) {
  const zipData = await readFile(
    new URL('../../google_transit.zip', import.meta.url),
    { encoding: null },
  );
  const zip = await JSZip.loadAsync(zipData);

  const file = zip.file(path);
  if (!file) {
    throw new Error(`${file} is missing from zip`);
  }

  const input = file.nodeStream('nodebuffer');
  const parser = parse({
    cast,
    columns: true,
  });
  yield* input.pipe(parser);
}

test('cast float', async (t) => {
  for await (const row of loadZipFile('stops.txt')) {
    t.is(typeof row.stop_id, 'string');
    t.is(typeof row.stop_lat, 'number');
    t.is(typeof row.stop_lon, 'number');
  }
});

test('cast int', async (t) => {
  for await (const row of loadZipFile('fare_attributes.txt')) {
    t.is(typeof row.fare_id, 'string');
    t.is(typeof row.payment_method, 'number');
    t.is(typeof row.transfers, 'number');
  }
});

test('cast bool and date', async (t) => {
  for await (const row of loadZipFile('calendar.txt')) {
    t.is(typeof row.service_id, 'string');
    t.is(typeof row.monday, 'boolean');
    t.is(typeof row.tuesday, 'boolean');
    t.is(typeof row.wednesday, 'boolean');
    t.is(typeof row.thursday, 'boolean');
    t.is(typeof row.friday, 'boolean');
    t.is(typeof row.saturday, 'boolean');
    t.is(typeof row.sunday, 'boolean');

    const date = row.start_date.split('-');
    t.is(date.length, 3);
    const [, month, day] = date;
    t.is(month.length, 2);
    t.is(day.length, 2);
  }
});
