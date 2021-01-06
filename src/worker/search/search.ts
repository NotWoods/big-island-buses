import {
  fuseRoutes,
  fuseStops,
  normalizeMatches,
  PredictionSubstring,
} from './gtfs-search';
import {
  AutocompletionRequest,
  getPlacePredictions,
} from './places-autocomplete';

export interface SearchResult<Type extends 'route' | 'stop' | 'place'> {
  type: Type;
  id: string;
  text: string;
  matches: readonly PredictionSubstring[];
}

export interface SearchResults {
  places: readonly SearchResult<'place'>[];
  routes: readonly SearchResult<'route'>[];
  stops: readonly SearchResult<'stop'>[];
}

export function search(request: AutocompletionRequest): Promise<SearchResults> {
  const placeSearchReady = getPlacePredictions(request);
  const routeSearch = fuseRoutes.search(request);
  const stopSearch = fuseStops.search(request);

  return placeSearchReady.then((placeSearch) => {
    return {
      places: placeSearch.predictions.map((prediction) => ({
        type: 'place',
        id: prediction.place_id,
        text: prediction.structured_formatting.main_text,
        matches: prediction.structured_formatting.main_text_matched_substrings,
      })),
      routes: routeSearch.map((result) => ({
        type: 'route',
        id: result.item.route_id,
        text: result.item.route_long_name,
        matches: normalizeMatches(result.matches),
      })),
      stops: stopSearch.map((result) => ({
        type: 'stop',
        id: result.item.stop_id,
        text: result.item.stop_name,
        matches: normalizeMatches(result.matches),
      })),
    };
  });
}
