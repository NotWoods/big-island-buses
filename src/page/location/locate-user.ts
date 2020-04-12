import { Store } from 'unistore';
import { State } from '../state/store';

/**
 * Start watching the user positon and update the store.
 */
export function locateUser(store: Store<State>) {
  let firstPosition = true;
  navigator.geolocation.watchPosition(
    function onsuccess({ coords }) {
      let newState: Partial<State> = {
        locatePermission: true,
        userLocation: { lat: coords.latitude, lng: coords.longitude },
      };
      if (firstPosition) {
        newState.focus = 'user';
        firstPosition = false;
      }
      store.setState(newState as State);
    },
    function onerror(error) {
      console.error(error);
      store.setState({ locatePermission: false });
    },
  );
}
