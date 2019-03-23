import { h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { MenuButton } from './ToolbarButton';

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

export const Map = ({
    stops,
}: {
    stops?: Record<string, Stop>;
    routes?: Map<string, Route>;
}) => {
    return (
        <section class="map" id="map">
            <div id="map-canvas" class="map__canvas">
                <StaticMap
                    height={640}
                    width={640}
                    stops={stops ? Object.values(stops) : []}
                />
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
