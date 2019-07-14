import { DBSchema } from 'idb';
import { Stop, RouteDetails, Route } from '../common/api-types';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';

export interface BusesSchema extends DBSchema {
    stops: {
        key: Stop['stop_id'];
        value: Stop;
        indexes: { lat: number; lon: number };
    };
    routes: {
        key: Route['route_id'];
        value: Route | RouteDetails;
    };
    meta: {
        key: 'version' | 'bounds';
        value: string | LatLngBoundsLiteral;
    };
}
