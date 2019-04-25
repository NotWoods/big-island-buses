// @ts-check
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

/** @type {import('rollup').RollupOptions} */
const pageConfig = {
    input: 'src/components/index.tsx',
    output: {
        dir: 'public/js/',
        format: 'esm',
        sourcemap: true,
        paths: {
            googlemaps: `https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI`,
        },
    },
    plugins: [resolve({ browser: true }), typescript()],
};

/** @type {import('rollup').RollupOptions} */
const workerConfig = {
    input: 'src/search/worker.ts',
    output: {
        file: 'public/js/search-worker.js',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [resolve({ browser: true }), typescript()],
};

/** @type {import('rollup').RollupOptions} */
const serverRenderConfig = {
    input: 'src/server-render/index.ts',
    output: {
        dir: 'lib',
        entryFileNames: 'server-render.js',
        format: 'cjs',
        sourcemap: true,
    },
    external: [
        'path',
        'fs-extra',
        'alasql',
        'countries-and-timezones',
        'preact-render-to-string',
        '@google/maps',
    ],
    plugins: [resolve(), typescript({ target: 'esnext' })],
};

export default [pageConfig, workerConfig, serverRenderConfig];
