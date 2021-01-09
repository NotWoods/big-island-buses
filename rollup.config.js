// @ts-check
import { createRequire } from 'module';
import consts from 'rollup-plugin-consts';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import { typescript as typescriptPreprocess } from 'svelte-preprocess';

// @ts-ignore
const require = createRequire(import.meta.url);
// @ts-ignore
const eleventy = require('./.eleventy.cjs');

const eleventyConfig = eleventy({
  addPlugin() {},
  addPassthroughCopy() {},
  addNunjucksAsyncFilter() {},
  addNunjucksAsyncShortcode() {},
  addTransform() {},
});

const development = true;

const constants = {
  pathPrefix: eleventyConfig.pathPrefix,
  infoWorker: 'worker/info.js',
  searchWorker: 'worker/search.js',
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
  composite: false,
  incremental: false,
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
    typescript({
      ...typescriptOptions,
      tsconfig: 'src/page/tsconfig.json',
    }),
    development ? undefined : terser(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const serviceWorker = {
  input: 'src/service-worker/index.js',
  output: {
    file: eleventyConfig.dir.output + '/service-worker.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [consts(constants), development ? undefined : terser()],
};

/** @type {import('rollup').RollupOptions} */
const infoWorkerConfig = {
  input: 'src/worker/info/index.js',
  output: {
    file: eleventyConfig.dir.output + '/' + constants.infoWorker,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve(), development ? undefined : terser()],
};

/** @type {import('rollup').RollupOptions} */
const searchWorkerConfig = {
  input: 'src/worker/search/index.js',
  output: {
    file: eleventyConfig.dir.output + '/' + constants.searchWorker,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    consts(constants),
    nodeResolve(),
    development ? undefined : terser(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const components = {
  input: 'src/page/component/index.ts',
  output: {
    file: 'lib/components.js',
    format: 'esm',
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
    typescript({
      ...typescriptOptions,
      tsconfig: 'src/page/tsconfig.json',
    }),
  ],
};

export default [
  config,
  serviceWorker,
  infoWorkerConfig,
  searchWorkerConfig,
  components,
];
