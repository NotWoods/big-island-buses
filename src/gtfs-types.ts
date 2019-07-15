import { sequence } from './load';

export interface Calendar {
    service_id: string;
    monday: '0' | '1';
    tuesday: '0' | '1';
    wednesday: '0' | '1';
    thursday: '0' | '1';
    friday: '0' | '1';
    saturday: '0' | '1';
    sunday: '0' | '1';
    start_date: string;
    end_date: string;

    days?: readonly [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
    ];
    text_name?: string;
}

export interface Route {
    route_id: string;
    route_short_name: string;
    route_long_name: string;
    route_type: string;
    route_color: string;
    route_text_color: string;
    agency_id: string;
    route_url: string;

    trips?: { [trip_id: string]: Trip };
}

export interface Trip {
    route_id: string;
    service_id: string;
    trip_id: string;
    direction_id: string;
    trip_short_name: string;
    trip_headsign: string;
    shape_id: string;

    stop_times?: {};
}

export interface Stop {
    stop_id: string;
    stop_name: string;
    stop_lat: string;
    stop_lon: string;

    trips?: {
        trip: Trip['trip_id'];
        dir: string;
        route: Route['route_id'];
        sequence: string;
        time: string;
    }[];
    routes?: Route['route_id'][];
}

export interface StopTime {
    trip_id: string;
    arrival_time: string;
    departure_time: string;
    stop_id: string;
    stop_sequence: string;
}
