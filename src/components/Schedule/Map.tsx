import { h } from 'preact';
import memoizeOne from 'memoize-one';
import { Stop, Trip } from '../../server-render/api-types';
import { MenuButton } from '../ToolbarButton';

const routeToStopsMap = memoizeOne((stops: Record<string, Stop>) => {
    const map = new Map<string, Stop[]>();
    for (const stop of Object.values(stops)) {
        for (const route_id of stop.route_ids) {
            const stopList = map.get(route_id) || [];
            stopList.push(stop);
            map.set(route_id, stopList);
        }
    }
    return map;
});

const StaticMap = (props: {
    height: number;
    width: number;
    stops: Iterable<Pick<Stop, 'lat' | 'lon'>>;
}) => {
    const markers = Array.from(props.stops, stop => `${stop.lat},${stop.lon}`);
    const args = new URLSearchParams({
        key: 'AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI',
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

export const MapRenderer = (props: {
    route_id?: string;
    stops?: Record<string, Stop>;
    trips?: Record<string, Pick<Trip, 'stop_times'>>;
}) => {
    let stops: Stop[] | undefined;
    if (props.stops) {
        if (props.route_id) {
            const map = routeToStopsMap(props.stops);
            stops = map.get(props.route_id) || [];
        } else {
            stops = Object.values(props.stops);
        }
    }

    return (
        <section class="map" id="map">
            <div id="map-canvas" class="map__canvas">
                {stops ? (
                    <StaticMap height={640} width={640} stops={stops} />
                ) : null}
            </div>
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
