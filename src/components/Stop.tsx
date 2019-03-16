import { h } from 'preact';
import { RouteProps, Route } from './Route';

interface StopProps {
    address: string;
    name: string;
    routes: RouteProps[];
}

export const Stop = (props: StopProps) => (
    <section class="stop" id="stop">
        <header class="stop__streetview" id="streetview-header">
            <div class="stop__streetview-canvas" id="streetview-canvas" />
            <h3 class="stop__name" id="stop_name">
                {props.name}
            </h3>
        </header>
        <div class="stop__details" id="stop_details">
            <div id="address-container" title="Bus stop address">
                <svg viewBox="0 0 24 24" alt="Bus stop address">
                    <path d="M12,2C8.1,2,5,5.1,5,9c0,5.2,7,13,7,13s7-7.8,7-13C19,5.1,15.9,2,12,2z M12,11.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5c1.4,0,2.5,1.1,2.5,2.5S13.4,11.5,12,11.5z" />
                </svg>
                <address class="stop__address" id="address">
                    {props.address}
                </address>
            </div>
            <h4 class="stop__connections-header">Connects to</h4>
            <ul class="stop__connections connection__list" id="connections">
                {props.routes.map(r => (
                    <Route key={r.href} class="connection" {...r} />
                ))}
            </ul>
        </div>
    </section>
);
