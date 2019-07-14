import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

/** @type {import('rollup').RollupOptions} */
const config = {
    input: 'src/main.js',
    output: {
        file: 'main.js',
        format: 'iife',
        sourcemap: true,
    },
    plugins: [commonjs(), terser()],
};

export default config;
