import clsx from 'clsx';
import { Component, h } from 'preact';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';
import { BASE_URL } from '../../config';
import { Route, RouteDetails, Stop } from '../../server-render/api-types';
import { TimeData } from '../Time';
import { MapContainer } from './MapContainer';
import { RouteHeader } from './RouteHeader';

interface Props {
    route_id?: string;
    trip_id?: string | null;
    stop_id?: string | null;
    stops?: Record<string, Stop>;
    routes?: Map<string, Route>;
    nowTime?: TimeData;
    name: string | null;
    color: string | null;
    text_color: string | null;
    bounds?: LatLngBoundsLiteral;
    onOpenStop?(stop_id: string): void;
}

interface State {
    route: RouteDetails | null;
    StopInfo: typeof import('../Stop').StopInfo;
    ScheduleInfo: typeof import('./ScheduleInfo').ScheduleInfo;
}

export class RouteInfo extends Component<Props, State> {
    async fetchRouteData() {
        if (this.props.route_id == null) {
            this.setState({ route: null });
        } else {
            const res = await fetch(
                `${BASE_URL}/api/routes/${this.props.route_id}.json`,
            );
            const details: RouteDetails = await res.json();
            this.setState({ route: details });
        }
    }

    componentDidMount() {
        this.fetchRouteData();
        import('../Stop').then(({ StopInfo }) => this.setState({ StopInfo }));
        import('./ScheduleInfo').then(({ ScheduleInfo }) =>
            this.setState({ ScheduleInfo }),
        );
    }
    componentDidUpdate(prevProps: Props) {
        if (prevProps.route_id !== this.props.route_id) this.fetchRouteData();
    }

    render(props: Props, { route, StopInfo, ScheduleInfo }: State) {
        return (
            <main
                id="main"
                class={clsx({
                    open: Boolean(props.route_id),
                    'open-stop': Boolean(props.stop_id),
                })}
            >
                <MapContainer
                    route_id={props.route_id}
                    stop_id={props.stop_id}
                    bounds={route ? route.bounds : props.bounds}
                    stops={props.stops}
                    onOpenStop={props.onOpenStop}
                />
                <div id="content">
                    {props.name && props.color && props.text_color ? (
                        <RouteHeader
                            name={props.name}
                            color={props.color}
                            textColor={props.text_color}
                        />
                    ) : null}
                    {route && ScheduleInfo ? (
                        <ScheduleInfo
                            {...route}
                            route_id={props.route_id}
                            trip_id={props.trip_id}
                            stops={props.stops}
                            nowTime={props.nowTime}
                        />
                    ) : null}
                    {StopInfo ? (
                        <StopInfo
                            stop_id={props.stop_id}
                            stops={props.stops}
                            routes={props.routes}
                        />
                    ) : null}
                    <div class="float-clear" />
                </div>
            </main>
        );
    }
}
