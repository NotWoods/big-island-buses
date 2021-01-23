import type { GTFSData, Stop } from '../../shared/gtfs-types.js';
import { memoize } from '../../shared/utils/memoize.js';
import { findClosestStop } from '../info-worker.js';
import type { State } from './store.js';

const getClosestToUser = memoize(findClosestStop);
const getClosestToSearch = memoize(findClosestStop);

export function closestToUser(
  stops: GTFSData['stops'],
  state: Pick<State, 'userLocation'>,
) {
  return getClosestToUser(stops, state.userLocation);
}

export function closestToSearch(
  stops: GTFSData['stops'],
  state: Pick<State, 'searchLocation'>,
) {
  return getClosestToSearch(stops, state.searchLocation?.location);
}

function getStopId(stop: Stop | undefined) {
  return stop?.stop_id;
}

/**
 * Returns the ID of the stop that should be displayed in the user interface.
 * @param stops Map of stop IDs to stops.
 * @param state Current UI state.
 */
export function stopToDisplay(
  stops: GTFSData['stops'],
  selectedStop: string | null | undefined,
  state: State,
) {
  return Promise.resolve().then(() => {
    switch (state.focus) {
      case 'user':
        return closestToUser(stops, state).then(getStopId);
      case 'search':
        return closestToSearch(stops, state).then(getStopId);
      case 'stop':
        return selectedStop || undefined;
    }
  });
}
