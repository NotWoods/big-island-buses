import { createStore, combineReducers } from 'redux';
import location, { LocationState } from './location';
import map, { MapState } from './map';
import page, { PageState } from './page';

export interface ReduxState {
  location: LocationState;
  map: MapState;
  page: PageState;
}

export default createStore(
  combineReducers<ReduxState>({
    location,
    map,
    page,
  }),
  {
    location: { pos: null, error: null },
    map: { working: true },
    page: { route_id: 'kona' }
  }
);
