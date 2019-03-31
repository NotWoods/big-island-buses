import { h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { GoogleStreetView } from './Google/GoogleStreetView';
import { RouteItem } from './RoutesList/Route';
import { InfoItem } from './Schedule/InfoItem';

interface StopProps {
    stop_id?: string | null;
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
}

const addressIcon = (
    <path d="M12,2C8.1,2,5,5.1,5,9c0,5.2,7,13,7,13s7-7.8,7-13C19,5.1,15.9,2,12,2z M12,11.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5c1.4,0,2.5,1.1,2.5,2.5S13.4,11.5,12,11.5z" />
);

export const StopInfo = (props: StopProps) => {
    let stop: Stop | null = null;
    if (props.stops && props.stop_id) {
        stop = props.stops[props.stop_id];
    }
    if (stop == null) return null;

    return (
        <section class="stop" id="stop">
            <header class="stop__streetview" id="streetview-header">
                <div class="stop__streetview-canvas" id="streetview-canvas">
                    <GoogleStreetView lat={stop.lat} lon={stop.lon} />
                </div>
                <h3 class="stop__name" id="stop_name">
                    {stop.name}
                </h3>
            </header>
            <div class="stop__details" id="stop_details">
                <InfoItem
                    id="address-container"
                    title="Bus stop address"
                    spanId="address"
                    icon={addressIcon}
                >
                    <address>{stop.address}</address>
                </InfoItem>
                <h4 class="stop__connections-header">Connects to</h4>
                {props.routes ? (
                    <ul
                        class="stop__connections connection__list"
                        id="connections"
                    >
                        {stop.route_ids.map(route_id => {
                            const route = props.routes!.get(route_id);
                            if (!route) return null;
                            return (
                                <RouteItem
                                    key={route_id}
                                    class="connection"
                                    {...route}
                                />
                            );
                        })}
                    </ul>
                ) : null}
            </div>
        </section>
    );
};
