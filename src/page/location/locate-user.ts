import { Store } from 'unistore';
import { State, LocationPermission } from '../state/store';
import type { Mutable } from 'type-fest';

let watchId: number = 0;

/**
 * Start watching the user positon and update the store.
 */
export function locateUser(store: Store<State>) {
  let firstPosition = true;
  navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    function onsuccess({ coords }) {
      let newState: Mutable<Partial<State>> = {
        locatePermission: LocationPermission.GRANTED,
        userLocation: { lat: coords.latitude, lng: coords.longitude },
      };
      if (firstPosition) {
        newState.focus = 'user';
        firstPosition = false;
      }
      store.setState(newState as State);
    },
    function onerror(error) {
      store.setState({ locatePermission: error.code as LocationPermission });
    },
  );
}
