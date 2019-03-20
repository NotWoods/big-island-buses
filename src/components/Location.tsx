import { h, Component } from 'preact';
import { Map } from './Map';
import { Routes, LocationDisclaimer } from './RoutesList/Routes';
import { RouteInfo } from './RouteInfo';
import { Route, Stop } from '../server-render/api-types';
import { TimeData } from './Time';

interface Props {
    nowTime: TimeData;
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    lastUpdated?: TimeData;
    maxDistance: number;
    route_id?: string;
    trip_id?: string;
    stop_id?: string;
    onClick(e: Event): void;
}

interface State {
    geolocationOn: boolean;
    userPosition: Position | null;
}

export class LocationApp extends Component<Props, State> {
    trackLocation = () =>
        navigator.geolocation.watchPosition(userPosition =>
            this.setState({ userPosition }),
        );

    locateUser(userPosition: Coordinates) {
        let closestDistance = Number.MAX_VALUE;
        let closestStop: Stop | null = null;
        const stops = this.props.stops ? Object.values(this.props.stops) : [];
        for (const stop of stops) {
            const distance = Math.sqrt(
                (userPosition.latitude - stop.lat) ** 2 +
                    (userPosition.longitude - stop.lon) ** 2,
            );
            if (distance < closestDistance) {
                closestStop = stop;
                closestDistance = distance;
            }
        }
        return closestDistance < this.props.maxDistance ? closestStop : null;
    }

    render(props: Props, state: State) {
        const route =
            props.routes && props.route_id
                ? props.routes.get(props.route_id)
                : null;
        const closestStop = state.userPosition
            ? this.locateUser(state.userPosition.coords)
            : null;
        return (
            <div onClick={props.onClick}>
                <Routes
                    nearby={new Set(closestStop ? closestStop.route_ids : [])}
                    routes={
                        props.routes ? Array.from(props.routes.values()) : []
                    }
                    lastUpdated={props.lastUpdated}
                    afterNearby={
                        state.geolocationOn ? null : (
                            <LocationDisclaimer onClick={this.trackLocation} />
                        )
                    }
                />
                <main id="main" class="open-stop open">
                    <Map />
                    <RouteInfo
                        route_id={props.route_id}
                        trip_id={props.trip_id}
                        stops={props.stops}
                        routes={props.routes}
                        nowTime={props.nowTime}
                        name={route ? route.name : null}
                        color={route ? route.color : null}
                        text_color={route ? route.text_color : null}
                    />
                </main>
            </div>
        );
    }
}
