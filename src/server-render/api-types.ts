export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Route {
    route_id: string;
    name: string;
    source_url: string;
    color: string;
    text_color: string;
    trip_ids: string[];
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
    trips: {
        trip_id: string;
        direction_id: number;
        route_id: string;
        sequence: number;
        time: string;
    }[];
    route_ids: string[];
}
