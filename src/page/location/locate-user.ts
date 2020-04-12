import { Store } from 'unistore';
import { State } from '../state/store';

/**
 * Start watching the user positon and update the store.
 */
export function locateUser(store: Store<State>) {
  navigator.geolocation.watchPosition(
    function onsuccess({ coords }) {
      store.setState({
        locatePermission: true,
        userLocation: { lat: coords.latitude, lng: coords.longitude },
      });
    },
    function onerror(error) {
      console.error(error);
      store.setState({ locatePermission: false });
    },
  );
}
