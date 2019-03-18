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
    route_ids: string[];
}

export interface Calendar {
    service_id: string;
    days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
    description: string;
    exceptions: {
        added: string[];
        removed: string[];
    };
}
