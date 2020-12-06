import consts from 'rollup-plugin-consts';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
const eleventy = require('./.eleventy.js');

const eleventyConfig = eleventy({
  addPassthroughCopy() {},
  addFilter() {},
  addTransform() {},
});

const infoWorker = 'worker/info.js';

const constants = {
  pathPrefix: eleventyConfig.pathPrefix,
  infoWorker
};

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/page/main.ts',
  output: {
    file: eleventyConfig.dir.output + '/main.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    consts(constants),
    nodeResolve(),
    typescript({ module: 'esnext' }),
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
  plugins: [consts(constants), typescript({ module: 'esnext' }), terser()],
};

/** @type {import('rollup').RollupOptions} */
const infoWorkerConfig = {
  input: 'src/worker/info/index.ts',
  output: {
    file: eleventyConfig.dir.output + '/' + infoWorker,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript({ module: 'esnext' }), terser()],
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
  plugins: [typescript({ module: 'esnext' })],
};

/** @type {import('rollup').RollupOptions} */
const filters = {
  input: 'src/lib/filters.ts',
  output: {
    file: 'lib/filters.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [typescript({ module: 'esnext' })],
};

export default [
  config,
  serviceWorker,
  infoWorkerConfig,
  apiGenerator,
  filters,
];
