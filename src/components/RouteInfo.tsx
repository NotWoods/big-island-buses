import { Component, h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { RouteHeader } from './RouteHeader';
import { RouteScheduleInfo } from './Schedule';
import { StopInfo } from './Stop';
import { TimeData } from './Time';
import { RouteData } from './RoutesList/Routes';

interface Props {
    route_id?: string;
    trip_id?: string | null;
    stop_id?: string | null;
    stops?: Record<string, Stop>;
    routes?: Map<string, Route>;
    nowTime: TimeData;
    name: string | null;
    color: string | null;
    text_color: string | null;
}

export class RouteInfo extends Component<Props> {
    render(props: Props) {
        let stop: Stop | null = null;
        let stopConnectedRoutes: RouteData[] = [];
        if (props.stops && props.stop_id) {
            stop = props.stops[props.stop_id];
            if (props.routes) {
                stopConnectedRoutes = stop.route_ids.map(
                    id => props.routes!.get(id)!,
                );
            }
        }
        return (
            <div id="content">
                {props.name && props.color && props.text_color ? (
                    <RouteHeader
                        name={props.name}
                        color={props.color}
                        textColor={props.text_color}
                    />
                ) : null}
                {props.route_id ? (
                    <RouteScheduleInfo
                        key={props.route_id}
                        route_id={props.route_id}
                        trip_id={props.trip_id}
                        stops={props.stops}
                        nowTime={props.nowTime}
                    />
                ) : null}
                {stop != null ? (
                    <StopInfo
                        lat={stop.lat}
                        lon={stop.lon}
                        name={stop.name}
                        routes={stopConnectedRoutes}
                    />
                ) : null}
                <div class="float-clear" />
            </div>
        );
    }
}
