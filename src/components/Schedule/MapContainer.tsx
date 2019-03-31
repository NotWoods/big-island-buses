import { Component, h } from 'preact';
import { MenuButton } from '../ToolbarButton';
import { MapRendererProps } from './Map';

interface State {
    MapRenderer?: typeof import('./Map').MapRenderer;
}

export class MapContainer extends Component<MapRendererProps, State> {
    componentDidMount() {
        import('./Map').then(({ MapRenderer }) =>
            this.setState({ MapRenderer }),
        );
    }

    render(props: MapRendererProps, { MapRenderer }: State) {
        return (
            <section class="map" id="map">
                {MapRenderer ? (
                    <MapRenderer
                        bounds={props.bounds}
                        route_id={props.route_id}
                        stop_id={props.stop_id}
                        stops={props.stops}
                        onOpenStop={props.onOpenStop}
                    />
                ) : null}
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
    }
}
