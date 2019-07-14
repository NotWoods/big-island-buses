import { Component, h } from 'preact';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';
import { Stop } from '../common/api-types';
import { StaticMap } from './StaticMap';
import memoizeOne from 'memoize-one';

export interface Props {
    bounds?: LatLngBoundsLiteral;
    route_id?: string;
    stop_id?: string;

    stops?: Map<Stop['stop_id'], Stop>;
    onOpenStop?(stop_id: string): void;
}

/**
 * Get map of route IDs to stop IDs of stops that the route passes through.
 */
const routeToStopsMap = memoizeOne((stops: Map<Stop['stop_id'], Stop>) => {
    const map = new Map<string, Set<Stop['stop_id']>>();
    for (const stop of stops.values()) {
        for (const route_id of stop.route_ids) {
            const stopList = map.get(route_id) || new Set();
            stopList.add(stop.stop_id);
            map.set(route_id, stopList);
        }
    }
    return map;
});

/**
 * Displays a map using the Google Maps API.
 *
 * @todo Add the dynamic map option
 */
class MapComponent extends Component<Props> {
    render(props: Props) {
        let highlighted: Set<string> | undefined;
        if (props.stops && props.route_id) {
            const map = routeToStopsMap(props.stops);
            highlighted = map.get(props.route_id);
        }

        return (
            <div id="map-canvas" class="map__canvas">
                {props.stops ? (
                    <StaticMap
                        height={640}
                        width={640}
                        stops={props.stops}
                        highlighted={highlighted}
                    />
                ) : null}
            </div>
        );
    }
}

export { MapComponent as Map };
