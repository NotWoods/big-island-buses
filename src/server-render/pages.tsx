import { outputFile, readFile, readJson } from 'fs-extra';
import { resolve } from 'path';
import { h, VNode } from 'preact';
import _render, { Options } from 'preact-render-to-string';
import { LocationApp } from '../components/Location';
import { TimeData, toDate } from '../components/Time';
import { BASE_URL } from '../config';
import { Route, Stop } from './api-types';

const render = (_render as unknown) as (
    vnode: VNode,
    context?: any,
    options?: Options,
) => string;

const TEMPLATE_FOLDER = resolve(__dirname, '..', 'templates');
const API_FOLDER = resolve(__dirname, '..', 'public', 'api');
const PAGES_FOLDER = resolve(__dirname, '..', 'public', 's');

async function template(file: string, data: Record<string, string>) {
    let text = await readFile(resolve(TEMPLATE_FOLDER, file), 'utf8');
    for (const [key, value] of Object.entries(data)) {
        text = text.replace(new RegExp(`{{\\s?${key}\\s?}}`, 'gmi'), value);
    }
    return text;
}

async function loadData() {
    const [routesRes, stops, version] = await Promise.all([
        readJson(resolve(API_FOLDER, 'routes.json')),
        readJson(resolve(API_FOLDER, 'stops.json')),
        readJson(resolve(API_FOLDER, 'version.json')),
    ]);

    const routes = new Map<string, Route>(
        routesRes.map((route: Route) => [route.route_id, route]),
    );
    return {
        routes,
        stops,
        lastUpdated: toDate(new Date(version.last_updated)),
        maxDistance: 0,
    };
}

async function makeTripPage(options: {
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    lastUpdated?: TimeData;
    maxDistance: number;
    route_id: string;
    trip_id: string;
    stop_id?: string;
}) {
    const html = render(<LocationApp {...options} />);
    const text = await template('page.html', { CONTENT: html, BASE_URL });
    outputFile(
        resolve(PAGES_FOLDER, options.route_id, `${options.trip_id}.html`),
        text,
        'utf8',
    );
}

export default async function main() {
    const data = await loadData();
    await Promise.all(
        Array.from(data.routes.values(), ({ route_id, trip_ids }) =>
            Promise.all(
                trip_ids.map(trip_id =>
                    makeTripPage({
                        ...data,
                        route_id,
                        trip_id,
                    }),
                ),
            ),
        ),
    );
}