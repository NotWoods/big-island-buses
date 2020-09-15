import { GTFSData, Stop } from '../../gtfs-types';
import { findClosestStop } from '../location/closest-stop';
import { memoize, State } from './store';

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
  return getClosestToSearch(stops, state.searchLocation);
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
  state: Pick<State, 'userLocation' | 'searchLocation' | 'focus' | 'stop'>,
) {
  return Promise.resolve().then(() => {
    switch (state.focus) {
      case 'user':
        return closestToUser(stops, state).then(getStopId);
      case 'search':
        return closestToSearch(stops, state).then(getStopId);
      case 'stop':
        return state.stop || undefined;
    }
  });
}
