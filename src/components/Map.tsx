import { h } from 'preact';
import { MenuButton } from './ToolbarButton';

export const Map = () => (
    <section class="map" id="map">
        <div id="map-canvas" class="map__canvas" />
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
