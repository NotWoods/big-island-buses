import { BASE_URL } from '../../config';
import { Stop } from '../../server-render/api-types';

const stopsReady = fetch(`${BASE_URL}/api/stops.json`)
    .then(res => res.json() as Promise<Record<string, Stop>>)
    .then(json => Object.values(json));

export async function stopsSearch(searchTerm: string) {
    const stops = await stopsReady;
    return stops.filter(stop => stop.name.includes(searchTerm));
}
