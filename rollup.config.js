// @ts-check
import typescript from 'rollup-plugin-typescript';

/** @type {import('rollup').RollupOptions} */
const pageConfig = {
    input: 'src/page/index.ts',
    output: {
        dir: 'public/js/',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [typescript()],
};

/** @type {import('rollup').RollupOptions} */
const serverRenderConfig = {
    input: 'src/server-render/api.ts',
    output: {
        file: 'lib/server-render.js',
        format: 'cjs',
        sourcemap: true,
    },
    external: ['path', 'fs-extra', 'alasql', 'countries-and-timezones'],
    plugins: [typescript({ target: 'esnext' })],
};

export default [serverRenderConfig];
