import { Component, h } from 'preact';
import { MenuButton } from '../common/ToolbarButton';

type Props = import('../map/Map').Props;

interface State {
    Map?: typeof import('../map/Map').Map;
}

export class MapContainer extends Component<Props, State> {
    componentDidMount() {
        import('../map/Map').then(({ Map }) => this.setState({ Map }));
    }

    render(props: Props, { Map }: State) {
        return (
            <section class="map" id="map">
                {Map ? <Map {...props} /> : null}
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
