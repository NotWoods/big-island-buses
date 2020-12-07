import { SearchRequest } from './helpers';

/**
 * @see https://developers.google.com/places/web-service/autocomplete#place_autocomplete_requests
 */
export interface AutocompletionRequest extends SearchRequest {
  input: string;
  key: string;
  sessiontoken: string;
  offset: number;
  location?: google.maps.LatLngLiteral;
  radius?: number;
  strictbounds?: boolean;
}

/**
 * @see https://developers.google.com/places/web-service/autocomplete#place_autocomplete_results
 */
export interface AutocompletionResponse {
  status: google.maps.places.PlacesServiceStatus;
  predictions: google.maps.places.AutocompletePrediction[];
  error_message?: string;
}

const BASIC_KEYS = [
  'input',
  'key',
  'sessiontoken',
  'radius',
  'offset',
] as const;

function requestToParams(
  request: AutocompletionRequest,
  target: URLSearchParams,
) {
  target.set('components', 'country:us');
  target.set('language', 'en');

  for (const key of BASIC_KEYS) {
    const value = request[key];
    if (value) {
      target.set(key, value.toString());
    }
  }
  if (request.location) {
    const { lat, lng } = request.location;
    target.set('location', `${lat},${lng}`);
  }
  if (request.strictbounds) {
    target.set('strictbounds', '');
  }

  return target;
}

export function getPlacePredictions(
  request: AutocompletionRequest,
): Promise<AutocompletionResponse> {
  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  );
  requestToParams(request, url.searchParams);

  return fetch(url.toString()).then((res) => res.json());
}
