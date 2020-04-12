import consts from 'rollup-plugin-consts';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';
const eleventy = require('./.eleventy.js');

const eleventyConfig = eleventy({
  addPassthroughCopy() {},
  addFilter() {},
  addTransform() {},
});

const closestStopWorker = 'worker/closest-stop.js';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/page/main.ts',
  output: {
    file: eleventyConfig.dir.output + '/main.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    consts({ pathPrefix: eleventyConfig.pathPrefix, closestStopWorker }),
    nodeResolve(),
    typescript(),
    terser(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const serviceWorker = {
  input: 'src/service-worker.ts',
  output: {
    file: eleventyConfig.dir.output + '/service-worker.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [consts({ closestStopWorker }), typescript(), terser()],
};

/** @type {import('rollup').RollupOptions} */
const closestStopWorkerConfig = {
  input: 'src/worker/closest-stop-worker.ts',
  output: {
    file: eleventyConfig.dir.output + '/' + closestStopWorker,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript(), terser()],
};

/** @type {import('rollup').RollupOptions} */
const apiGenerator = {
  input: 'src/lib/api.ts',
  output: {
    file: 'lib/api.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['fs', 'path', 'util', 'jszip'],
  plugins: [typescript()],
};

/** @type {import('rollup').RollupOptions} */
const filters = {
  input: 'src/lib/filters.ts',
  output: {
    file: 'lib/filters.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [typescript()],
};

export default [
  config,
  serviceWorker,
  closestStopWorkerConfig,
  apiGenerator,
  filters,
];
