import { Stop } from '../../gtfs-types';
import { clickEvent } from '../load';
import { LinkableMarker } from '../main';
import { LatLngLiteral } from '../state/store';
import { Type } from '../utils/link';

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
      marker.Type = Type.STOP;

      google.maps.event.addListener(marker, 'click', clickEvent);
    }

    marker.Value = stop_id!;
    marker.setPosition(location);

    return marker;
  };
}
