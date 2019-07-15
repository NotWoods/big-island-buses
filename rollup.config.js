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

export default config;
