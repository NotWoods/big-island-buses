import { h } from 'preact';
import memoizeOne from 'memoize-one';
import { Stop, Trip } from '../../server-render/api-types';
import { MenuButton } from '../ToolbarButton';
import { GoogleMap } from '../Google/GoogleMap';

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

export const MapRenderer = (props: {
    route_id?: string | null;
    stop_id?: string | null;
    stops?: Record<string, Stop>;
    trips?: Record<string, Pick<Trip, 'stop_times'>>;
    onOpenStop?(stop_id: string): void;
}) => {
    let highlighted: Set<string> | undefined;
    if (props.stops) {
        if (props.route_id) {
            const map = routeToStopsMap(props.stops);
            highlighted = map.get(props.route_id);
        }
    }

    return (
        <section class="map" id="map">
            <GoogleMap
                stop_id={props.stop_id}
                stops={props.stops}
                highlighted={highlighted}
                onOpenStop={props.onOpenStop}
            />
            <header class="map__header toolbar" id="map-header">
                <MenuButton id="menu" />
                <input
                    type="search"
                    name="Map Search"
                    id="search"
                    class="toolbar__search"
                    aria-label="Enter a location"
                    placeholder="Enter a location"
                    autocomplete="off"
                />
            </header>
        </section>
    );
};
