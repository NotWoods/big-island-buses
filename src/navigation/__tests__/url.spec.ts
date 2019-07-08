import { urlToState } from '../url';

describe('urlToState', () => {
    const base = 'https://notwoods.github.io';
    test('parses old hash URLs', () => {
        expect(urlToState(new URL('/#!route=hilo-hono', base))).toEqual({
            route_id: 'hilo-hono',
            trip_id: null,
            stop_id: null,
        });
        expect(urlToState(new URL('/#!route=hilo-hono&stop=js', base))).toEqual(
            {
                route_id: 'hilo-hono',
                trip_id: null,
                stop_id: 'js',
            },
        );
        expect(urlToState(new URL('/#!route=hawi&trip=hak600', base))).toEqual({
            route_id: 'hawi',
            trip_id: 'hak600',
            stop_id: null,
        });
        expect(
            urlToState(new URL('/#!route=kona&trip=deg233&stop=ds', base)),
        ).toEqual({
            route_id: 'kona',
            trip_id: 'deg233',
            stop_id: 'ds',
        });
    });

    test('parses paths', () => {
        expect(urlToState(new URL('/', base))).toEqual({
            route_id: null,
            trip_id: null,
            stop_id: null,
        });
        expect(urlToState(new URL('/s/hilo-hono', base))).toEqual({
            route_id: 'hilo-hono',
            trip_id: undefined,
            stop_id: null,
        });
        expect(urlToState(new URL('/s/waimea', base))).toEqual({
            route_id: 'waimea',
            trip_id: undefined,
            stop_id: null,
        });
        expect(urlToState(new URL('/s/hilo-hono?stop=js', base))).toEqual({
            route_id: 'hilo-hono',
            trip_id: undefined,
            stop_id: 'js',
        });
        expect(urlToState(new URL('/s/waimea?stop=pa', base))).toEqual({
            route_id: 'waimea',
            trip_id: undefined,
            stop_id: 'pa',
        });
        expect(urlToState(new URL('/s/hawi/hak600', base))).toEqual({
            route_id: 'hawi',
            trip_id: 'hak600',
            stop_id: null,
        });
        expect(urlToState(new URL('/s/hawi/was200/', base))).toEqual({
            route_id: 'hawi',
            trip_id: 'was200',
            stop_id: null,
        });
        expect(urlToState(new URL('/s/kona/deg233?stop=ds', base))).toEqual({
            route_id: 'kona',
            trip_id: 'deg233',
            stop_id: 'ds',
        });
        expect(urlToState(new URL('/s/kona/deg233/?stop=ds', base))).toEqual({
            route_id: 'kona',
            trip_id: 'deg233',
            stop_id: 'ds',
        });
    });
});
