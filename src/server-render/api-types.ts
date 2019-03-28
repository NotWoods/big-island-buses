import { LatLngBoundsLiteral } from 'spherical-geometry-js';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Weekdays = [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
];

export interface Route {
    route_id: string;
    timezone: string;
    name: string;
    source_url: string;
    color: string;
    text_color: string;
    trip_ids: string[];
    sort_order: number;
}

export interface RouteDetails extends Omit<Route, 'trip_ids'> {
    trips: Record<string, Trip>;
    first_stop: string;
    last_stop: string;
    start_time: string;
    end_time: string;
    days: Weekdays;
    bounds: LatLngBoundsLiteral;
}

export interface Trip {
    route_id: string;
    service_id: string;
    trip_id: string;
    headsign: string;
    name: string;
    direction_id: number;
    stop_times: StopTime[];
}

export interface StopTime {
    time: string;
    stop_id: string;
}

export interface Stop {
    stop_id: string;
    name: string;
    lat: number;
    lon: number;
    address: string;
    route_ids: string[];
}

export interface Calendar {
    service_id: string;
    days: Weekdays;
    description: string;
    exceptions: {
        added: string[];
        removed: string[];
    };
}
