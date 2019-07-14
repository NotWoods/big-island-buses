import clsx from 'clsx';
import { Component, h } from 'preact';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';
import { Route, RouteDetails, Stop } from '../common/api-types';
import { TimeData } from '../common/Time';
import { BASE_URL } from '../config';
import { RouteHeader } from '../schedule-info/route-info/RouteHeader';
import { MapContainer } from './MapContainer';

interface Props {
    readonly route?: Pick<Route, 'name' | 'color' | 'text_color'>;
    route_id?: string;
    trip_id?: string;
    stop_id?: string;
    stops?: Map<Stop['stop_id'], Stop>;
    routes?: Map<Route['route_id'], Route>;
    nowTime?: TimeData;
    name?: string;
    color?: string;
    text_color?: string;
    bounds?: LatLngBoundsLiteral;
    onOpenStop?(stop_id: string): void;
}

interface State {
    route?: RouteDetails;
    StopInfo: typeof import('./stop-info/StopInfo').StopInfo;
    RouteInfo: typeof import('./route-info/RouteInfo').RouteInfo;
}

export class ScheduleInfo extends Component<Props, State> {
    async fetchRouteData() {
        if (this.props.route_id == undefined) {
            this.setState({ route: undefined });
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
        import('./stop-info/StopInfo').then(({ StopInfo }) =>
            this.setState({ StopInfo }),
        );
        import('./route-info/RouteInfo').then(({ RouteInfo }) =>
            this.setState({ RouteInfo }),
        );
    }
    componentDidUpdate(prevProps: Props) {
        if (prevProps.route_id !== this.props.route_id) this.fetchRouteData();
    }

    render(props: Props, { route, StopInfo, RouteInfo }: State) {
        const stops = props.stops || new Map<Stop['stop_id'], Stop>();
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
                    {props.route ? <RouteHeader route={props.route} /> : null}
                    {RouteInfo ? (
                        <RouteInfo
                            routeId={props.route_id}
                            selectedTripId={props.trip_id}
                            stops={stops}
                            nowTime={props.nowTime}
                        />
                    ) : null}
                    {StopInfo ? (
                        <StopInfo
                            stop={stops.get(props.stop_id!)}
                            routes={props.routes}
                        />
                    ) : null}
                    <div class="float-clear" />
                </div>
            </main>
        );
    }
}
