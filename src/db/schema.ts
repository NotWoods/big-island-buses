import { DBSchema } from 'idb';
import { Stop } from '../server-render/api-types';

export interface BusesSchema extends DBSchema {
    stops: {
        key: string;
        value: Stop;
        indexes: { lat: number; lon: number };
    };
}
