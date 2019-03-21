import { h } from 'preact';
import { MenuButton, ToolbarButton } from './ToolbarButton';

interface RouteHeaderProps {
    name: string;
    color: string;
    textColor: string;
}

export const RouteHeader = (props: RouteHeaderProps) => (
    <header class="route-header" id="route-header">
        <MenuButton id="alt-menu" fill="#fff" />
        <h2
            class="route-header__label"
            id="route_long_name"
            style={`background-color:${props.color};color:${props.textColor}`}
        >
            {props.name}
        </h2>

        <ToolbarButton id="map-toggle" title="Enlarge Street View">
            <svg class="icon" viewBox="0 0 24 24" id="fullscreen">
                <path d="M7,14H5v5h5v-2H7V14z M5,10h2V7h3V5H5V10z M17,17h-3v2h5v-5h-2V17z M14,5v2h3v3h2V5H14z" />
            </svg>
            <svg class="icon" viewBox="0 0 24 24" id="fullscreen-exit">
                <path d="M5,16h3v3h2v-5H5V16z M8,8H5v2h5V5H8V8z M14,19h2v-3h3v-2h-5V19z M16,8V5h-2v5h5V8H16z" />
            </svg>
        </ToolbarButton>
    </header>
);
