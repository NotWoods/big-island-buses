const PLACE_API =
    'https://maps.googleapis.com/maps/api/place/autocomplete/json?';

export interface AutocompletionRequest {
    input: string;
    key: string;
    sessiontoken?: string;
    offset?: string;
    location?: string;
    radius?: string;
    language?: string;
    types?: string;
    components?: string;
    strictbounds?: string;
}

export interface AutocompletePredictions {
    status: google.maps.places.PlacesServiceStatus;
    predictions: google.maps.places.AutocompletePrediction[];
}

export async function placePredictions(
    request: AutocompletionRequest,
    signal?: AbortSignal,
) {
    const params = new URLSearchParams(request as any);
    const res = await fetch(PLACE_API + params.toString(), { signal });
    const result: AutocompletePredictions = await res.json();
    return result.predictions;
}
