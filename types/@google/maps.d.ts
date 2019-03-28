export interface ApiResult<T> {
    asPromise(): Promise<{ json: { results: T } }>;
}

export interface Client {
    reverseGeocode(options: {
        latlng?: string | [number, number];
        place_id?: string;
        language?: string;
        result_type?: string[];
        location_type?: string[];
    }): ApiResult<{ formatted_address: string }[]>;
}

export function createClient(options: {
    key: string;
    Promise?: typeof Promise;
}): Client;
