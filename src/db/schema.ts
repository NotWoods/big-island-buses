import { DBSchema } from 'idb';
import { Stop, RouteDetails } from '../common/api-types';

export interface BusesSchema extends DBSchema {
    stops: {
        key: Stop['stop_id'];
        value: Stop;
        indexes: { lat: number; lon: number };
    };
    routes: {
        key: RouteDetails['route_id'];
        value: RouteDetails;
    };
}
