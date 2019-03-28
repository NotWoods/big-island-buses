import { Component, h } from 'preact';
import { MenuButton } from '../ToolbarButton';
import { loadGoogleMaps } from './load';

interface Props {}

interface State {
    value: string;
}

export class GooglePlacesSearchBox extends Component<Props, State> {
    service?: google.maps.places.AutocompleteService;

    async componentDidMount() {
        const { places } = await loadGoogleMaps();
        this.service = new places.AutocompleteService();
    }

    render() {
        return (
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
                    value={this.state.value}
                />
            </header>
        );
    }
}
