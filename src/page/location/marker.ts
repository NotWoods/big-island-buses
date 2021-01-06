import { Stop } from '../../shared/gtfs-types';
import { LatLngLiteral } from '../state/store';
import { clickEvent, LinkableMarker } from '../links/open';

export function createLocationMarker(
  options: google.maps.ReadonlyMarkerOptions,
) {
  let marker: LinkableMarker | undefined;
  return (
    map: google.maps.Map,
    location: LatLngLiteral,
    stop_id?: Stop['stop_id'],
  ) => {
    if (!marker) {
      marker = new google.maps.Marker(options) as LinkableMarker;
      marker.setMap(map);
      marker.set('type', 'stop');

      google.maps.event.addListener(marker, 'click', clickEvent);
    }

    marker.set('value', stop_id!);
    marker.setPosition(location);

    return marker;
  };
}
