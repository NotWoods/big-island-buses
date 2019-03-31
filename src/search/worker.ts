import { stopsSearch } from './stops';
import { placePredictions, AutocompletionRequest } from './places';

export declare var self: WorkerGlobalScope;

export interface SearchResult {
    type: 'stop' | 'place';
    id: string;
    name: string;
}

let lastController: AbortController | undefined;

async function getPredictions(request: AutocompletionRequest) {
    let signal: AbortSignal | undefined;
    if (typeof AbortController !== 'undefined') {
        const controller = new AbortController();
        lastController = controller;
        signal = controller.signal;
    }
    const [stops, places] = await Promise.all([
        stopsSearch(request.input),
        placePredictions(request, signal),
    ]);

    const stopSearchResults: SearchResult[] = stops.map(stop => ({
        type: 'stop' as 'stop',
        name: stop.name,
        id: stop.stop_id,
    }));
    const placeSearchResults: SearchResult[] = places.map(place => ({
        type: 'place' as 'place',
        name: place.description,
        id: place.place_id,
    }));
    return [...stopSearchResults, ...placeSearchResults];
}

onmessage = async evt => {
    const request = evt.data;
    if (lastController) lastController.abort();
    const result = await getPredictions(request);
    postMessage(result);
};
