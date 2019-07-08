import memoizeOne from 'memoize-one';
import { Component, h } from 'preact';
import {
    computeDistanceBetween,
    LatLngBoundsLiteral,
} from 'spherical-geometry-js';
import { Route, Stop } from '../common/api-types';
import { LocationDisclaimer, Sidebar } from '../sidebar/Sidebar';
import { TimeData } from '../common/Time';

interface Props {
    nowTime?: TimeData;
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    lastUpdated?: TimeData;
    maxDistance: number;
    route_id?: string;
    trip_id?: string;
    stop_id?: string;
    bounds?: LatLngBoundsLiteral;
    onClick?(e: Event): void;
    onChange?(e: Event): void;
    onOpenStop?(stop_id: string): void;
}

interface State {
    geolocationOn: boolean;
    userPosition?: Position;
    ScheduleInfo: typeof import('../schedule-info/ScheduleInfo').ScheduleInfo;
}

export class LocationApp extends Component<Props, State> {
    componentDidMount() {
        import('../schedule-info/ScheduleInfo').then(({ ScheduleInfo }) =>
            this.setState({ ScheduleInfo }),
        );
    }

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
        let closestStop: Stop | undefined = undefined;
        const stops = this.props.stops ? Object.values(this.props.stops) : [];
        for (const stop of stops) {
            const distance = computeDistanceBetween(userPos, stop);
            if (distance < closestDistance) {
                closestStop = stop;
                closestDistance = distance;
            }
        }
        return closestDistance < this.props.maxDistance
            ? closestStop
            : undefined;
    });

    render(props: Props, { userPosition, geolocationOn, ScheduleInfo }: State) {
        let route: Route | undefined = undefined;
        let stop_id: string | undefined = props.stop_id;
        let closestStop: Stop | undefined = undefined;
        if (props.routes && props.route_id) {
            route = props.routes.get(props.route_id);
        }
        if (userPosition) {
            closestStop = this.locateUser(userPosition.coords);
            if (!stop_id && closestStop) stop_id = closestStop.stop_id;
        }
        return (
            <div id="root" onClick={props.onClick} onChange={props.onChange}>
                <Sidebar
                    nearby={new Set(closestStop ? closestStop.route_ids : [])}
                    routes={
                        props.routes ? Array.from(props.routes.values()) : []
                    }
                    lastUpdated={props.lastUpdated}
                    afterNearby={
                        geolocationOn ? null : (
                            <LocationDisclaimer onClick={this.trackLocation} />
                        )
                    }
                />
                <div id="screen-cover" />
                {ScheduleInfo ? (
                    <ScheduleInfo
                        route_id={props.route_id}
                        trip_id={props.trip_id}
                        stop_id={stop_id}
                        stops={props.stops}
                        routes={props.routes}
                        nowTime={props.nowTime}
                        bounds={props.bounds}
                        name={route ? route.name : undefined}
                        color={route ? route.color : undefined}
                        text_color={route ? route.text_color : undefined}
                        onOpenStop={props.onOpenStop}
                    />
                ) : null}
            </div>
        );
    }
}
