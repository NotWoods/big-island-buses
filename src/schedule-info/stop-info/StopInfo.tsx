import { h } from 'preact';
import { Route, Stop } from '../../common/api-types';
import { GoogleStreetView } from './GoogleStreetView';
import { RouteItem } from './Route';
import { AddressInfoItem } from './AddressInfoItem';

interface Props {
    readonly stop?: Stop;
    routes?: Map<Route['route_id'], Route>;
}

export const StopInfo = ({ stop, routes }: Props) => {
    if (!stop) return null;

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
                <AddressInfoItem stop={stop} />
                <h4 class="stop__connections-header">Connects to</h4>
                {routes ? (
                    <ul
                        class="stop__connections connection__list"
                        id="connections"
                    >
                        {stop.route_ids.map(route_id => (
                            <RouteItem
                                key={route_id}
                                route={routes.get(route_id)}
                            />
                        ))}
                    </ul>
                ) : null}
            </div>
        </section>
    );
};
