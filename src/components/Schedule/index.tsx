import clsx from 'clsx';
import { Component, h } from 'preact';
import { BASE_URL } from '../../config';
import { Route, RouteDetails, Stop } from '../../server-render/api-types';
import { RouteHeader } from './RouteHeader';
import { StopInfo } from '../Stop';
import { TimeData } from '../Time';
import { MapRenderer } from './Map';
import { ScheduleInfo } from './ScheduleInfo';

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
    onOpenStop?(stop_id: string): void;
}

interface State {
    route: RouteDetails | null;
}

export class RouteInfo extends Component<Props, State> {
    async fetchRouteData() {
        if (this.props.route_id == null) {
            // this.setState({ route: null });
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
    }
    componentDidUpdate(prevProps: Props) {
        if (prevProps.route_id !== this.props.route_id) this.fetchRouteData();
    }

    render(props: Props, state: State) {
        let stop: Stop | null = null;
        if (props.stops && props.stop_id) {
            stop = props.stops[props.stop_id];
        }
        return (
            <main
                id="main"
                class={clsx({
                    open: Boolean(props.route_id),
                    'open-stop': Boolean(props.stop_id),
                })}
            >
                <MapRenderer
                    route_id={props.route_id}
                    stop_id={props.stop_id}
                    trips={state.route ? state.route.trips : undefined}
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
                    {state.route ? (
                        <ScheduleInfo
                            {...state.route}
                            route_id={props.route_id}
                            trip_id={props.trip_id}
                            stops={props.stops}
                            nowTime={props.nowTime}
                        />
                    ) : null}
                    {stop != null ? (
                        <StopInfo stop={stop} routes={props.routes} />
                    ) : null}
                    <div class="float-clear" />
                </div>
            </main>
        );
    }
}
