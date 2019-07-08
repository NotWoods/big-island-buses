import { h, FunctionalComponent } from 'preact';
import { Stop } from '../common/api-types';
import { API_KEY } from '../config';

interface Props {
    /** Height of the map image */
    height: number;
    /** Width of the map image */
    width: number;
    /** Stops to display on the map. */
    stops: Record<string, Stop>;
    /** If provided, only stops with matching IDs will be shown on the map. */
    highlighted?: Set<Stop['stop_id']>;
}

const stopToMarker = (stop: Pick<Stop, 'lat' | 'lon'>) =>
    `${stop.lat},${stop.lon}`;

export const StaticMap: FunctionalComponent<Props> = props => {
    let markers: string[];
    if (props.highlighted && props.highlighted.size > 0) {
        markers = Object.values(props.stops)
            .filter(stop => props.highlighted!.has(stop.stop_id))
            .map(stopToMarker);
    } else {
        markers = Object.values(props.stops).map(stopToMarker);
    }
    const args = new URLSearchParams({
        key: API_KEY,
        markers: markers.join('|'),
        size: `${props.width}x${props.height}`,
    });
    const src = `https://maps.googleapis.com/maps/api/staticmap?${args.toString()}`;
    return (
        <img
            class="map__canvas-static"
            height={props.height}
            width={props.width}
            src={src}
            srcset={`${src} 1x, ${src}&scale=2 2x`}
            alt="Map displaying stop locations on island"
        />
    );
};
