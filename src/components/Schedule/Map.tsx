import memoizeOne from 'memoize-one';
import { h } from 'preact';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';
import { Stop } from '../../server-render/api-types';
import { GoogleMap } from '../google/GoogleMap';

const routeToStopsMap = memoizeOne((stops: Record<string, Stop>) => {
    const map = new Map<string, Set<string>>();
    for (const stop of Object.values(stops)) {
        for (const route_id of stop.route_ids) {
            const stopList = map.get(route_id) || new Set();
            stopList.add(stop.stop_id);
            map.set(route_id, stopList);
        }
    }
    return map;
});

export interface MapRendererProps {
    bounds?: LatLngBoundsLiteral;
    route_id?: string;
    stop_id?: string;
    stops?: Record<string, Stop>;
    onOpenStop?(stop_id: string): void;
}

export const MapRenderer = (props: MapRendererProps) => {
    let highlighted: Set<string> | undefined;
    if (props.stops) {
        if (props.route_id) {
            const map = routeToStopsMap(props.stops);
            highlighted = map.get(props.route_id);
        }
    }

    return (
        <GoogleMap
            bounds={props.bounds}
            stop_id={props.stop_id}
            stops={props.stops}
            highlighted={highlighted}
            onOpenStop={props.onOpenStop}
        />
    );
};
