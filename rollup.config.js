// @ts-check
import consts from 'rollup-plugin-consts';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import { typescript as typescriptPreprocess } from 'svelte-preprocess';
const eleventy = require('./.eleventy.js');

const eleventyConfig = eleventy({
  addPassthroughCopy() {},
  addFilter() {},
  addShortcode() {},
  addTransform() {},
});

const infoWorker = 'worker/info.js';

const development = true;

const constants = {
  pathPrefix: eleventyConfig.pathPrefix,
  infoWorker,
  development,
};

const svelteOptions = {
  dev: development,
  hydratable: true,
  immutable: true,
  css: false,
};

const typescriptOptions = {
  module: 'esnext',
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
    svelte({
      compilerOptions: { ...svelteOptions, generate: 'dom' },
      preprocess: typescriptPreprocess({
        compilerOptions: typescriptOptions,
      }),
    }),
    consts(constants),
    nodeResolve(),
    typescript(typescriptOptions),
    development ? undefined : terser(),
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
  plugins: [
    consts(constants),
    typescript(typescriptOptions),
    development ? undefined : terser(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const infoWorkerConfig = {
  input: 'src/worker/info/index.ts',
  output: {
    file: eleventyConfig.dir.output + '/' + infoWorker,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(typescriptOptions),
    development ? undefined : terser(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const apiGenerator = {
  input: 'src/lib/api.ts',
  output: {
    file: 'lib/api.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['fs', 'path', 'util', 'jszip', 'fuse.js'],
  plugins: [typescript(typescriptOptions)],
};

/** @type {import('rollup').RollupOptions} */
const filters = {
  input: 'src/lib/filters.ts',
  output: {
    file: 'lib/filters.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [typescript(typescriptOptions)],
};

/** @type {import('rollup').RollupOptions} */
const components = {
  input: 'src/page/component/index.ts',
  output: {
    file: 'lib/components.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    svelte({
      compilerOptions: { ...svelteOptions, generate: 'ssr' },
      preprocess: typescriptPreprocess({
        compilerOptions: typescriptOptions,
      }),
    }),
    consts(constants),
    nodeResolve(),
    typescript(typescriptOptions),
  ],
};

export default [
  config,
  serviceWorker,
  infoWorkerConfig,
  apiGenerator,
  filters,
  components,
];
