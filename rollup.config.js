import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';

/** @type {import('rollup').RollupOptions} */
const config = {
    input: 'src/main.ts',
    output: {
        file: 'main.js',
        format: 'iife',
        sourcemap: true,
    },
    plugins: [commonjs(), typescript(), terser()],
};

/** @type {import('rollup').RollupOptions} */
const serviceWorker = {
    input: 'src/service-worker.ts',
    output: {
        file: 'service-worker.js',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [typescript(), terser()],
};

/** @type {import('rollup').RollupOptions} */
const apiGenerator = {
    input: 'src/api.ts',
    output: {
        file: 'lib/api.js',
        format: 'cjs',
        sourcemap: true,
    },
    external: ['fs', 'path', 'util', 'jszip'],
    plugins: [typescript()],
};

export default [config, serviceWorker, apiGenerator];
