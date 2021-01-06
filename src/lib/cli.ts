import { resolve } from 'path';
import { generateApi } from './api.js';

const args = process.argv.slice(2);
if (args.length !== 2) {
  throw new TypeError(`should pass 2 arguments, not ${args.length}.`);
}

const [gtfsZipPath, apiFolder] = args.map((path) => resolve(path));

generateApi(gtfsZipPath, apiFolder)
  .then(() => {
    console.log('Wrote API files');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
