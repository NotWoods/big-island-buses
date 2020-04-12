import { memoize, State } from './store';
import { findClosestStop } from '../location/closest-stop';
import { GTFSData } from '../../gtfs-types';

const getClosestToUser = memoize(findClosestStop);
const getClosestToSearch = memoize(findClosestStop);

export function closestToUser(stops: GTFSData['stops'], state: State) {
  return getClosestToUser(stops, state.userLocation);
}

export function closestToSearch(stops: GTFSData['stops'], state: State) {
  return getClosestToSearch(stops, state.searchLocation);
}

export function stopToDisplay(stops: GTFSData['stops'], state: State) {
  return Promise.resolve().then(() => {
    switch (state.focus) {
      case 'user':
        return closestToUser(stops, state)?.stop_id;
      case 'search':
        return closestToSearch(stops, state)?.stop_id;
      case 'stop':
        return state.stop;
    }
  });
}
