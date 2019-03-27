import memoizeOne from 'memoize-one';
import { Component, h } from 'preact';
import { computeDistanceBetween } from 'spherical-geometry-js';
import { Route, Stop } from '../server-render/api-types';
import { LocationDisclaimer, Routes } from './RoutesList/Routes';
import { RouteInfo } from './Schedule';
import { TimeData } from './Time';

interface Props {
    nowTime?: TimeData;
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    lastUpdated?: TimeData;
    maxDistance: number;
    route_id?: string;
    trip_id?: string;
    stop_id?: string;
    onClick?(e: Event): void;
    onChange?(e: Event): void;
    onOpenStop?(stop_id: string): void;
}

interface State {
    geolocationOn: boolean;
    userPosition: Position | null;
}

export class LocationApp extends Component<Props, State> {
    trackLocation = () =>
        navigator.geolocation.watchPosition(userPosition =>
            this.setState({ userPosition, geolocationOn: true }),
        );

    locateUser = memoizeOne((userPosition: Coordinates) => {
        const userPos = {
            lat: userPosition.latitude,
            lon: userPosition.longitude,
        };
        let closestDistance = Number.MAX_VALUE;
        let closestStop: Stop | null = null;
        const stops = this.props.stops ? Object.values(this.props.stops) : [];
        for (const stop of stops) {
            const distance = computeDistanceBetween(userPos, stop);
            if (distance < closestDistance) {
                closestStop = stop;
                closestDistance = distance;
            }
        }
        return closestDistance < this.props.maxDistance ? closestStop : null;
    });

    render(props: Props, state: State) {
        let route: Route | null | undefined = null;
        let stop_id: string | null | undefined = props.stop_id;
        let closestStop: Stop | null = null;
        if (props.routes && props.route_id) {
            route = props.routes.get(props.route_id);
        }
        if (state.userPosition) {
            closestStop = this.locateUser(state.userPosition.coords);
            if (!stop_id && closestStop) stop_id = closestStop.stop_id;
        }
        return (
            <div id="root" onClick={props.onClick} onChange={props.onChange}>
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
                <div id="screen-cover" />
                <RouteInfo
                    route_id={props.route_id}
                    trip_id={props.trip_id}
                    stop_id={stop_id}
                    stops={props.stops}
                    routes={props.routes}
                    nowTime={props.nowTime}
                    name={route ? route.name : null}
                    color={route ? route.color : null}
                    text_color={route ? route.text_color : null}
                    onOpenStop={props.onOpenStop}
                />
            </div>
        );
    }
}
