import { GTFSData, Stop } from '../../gtfs-types';
import { findClosestStop } from '../location/closest-stop';
import { memoize, State } from './store';

const getClosestToUser = memoize(findClosestStop);
const getClosestToSearch = memoize(findClosestStop);

export function closestToUser(stops: GTFSData['stops'], state: State) {
  return getClosestToUser(stops, state.userLocation);
}

export function closestToSearch(stops: GTFSData['stops'], state: State) {
  return getClosestToSearch(stops, state.searchLocation);
}

function getStopId(stop: Stop | undefined) {
  return stop?.stop_id;
}

export function stopToDisplay(stops: GTFSData['stops'], state: State) {
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
