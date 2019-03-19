import { Component, h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { RouteHeader } from './RouteHeader';
import { RouteScheduleInfo } from './Schedule';
import { StopInfo } from './Stop';
import { TimeData } from './Time';

interface Props {
    key: string;
    route_id: string;
    trip_id?: string | null;
    stop_id?: string | null;
    stops: Record<string, Stop>;
    routes: Map<string, Route>;
    nowTime: TimeData;
    name: string;
    color: string;
    text_color: string;
}

export class RouteInfo extends Component<Props> {
    render(props: Props) {
        const stop = props.stop_id ? props.stops[props.stop_id] : null;
        return (
            <div id="content">
                <RouteHeader
                    name={props.name}
                    color={props.color}
                    textColor={props.text_color}
                />
                <RouteScheduleInfo
                    key={props.route_id}
                    route_id={props.route_id}
                    trip_id={props.trip_id}
                    stops={props.stops}
                    nowTime={props.nowTime}
                />
                {stop != null ? (
                    <StopInfo
                        lat={stop.lat}
                        lon={stop.lon}
                        name={stop.name}
                        routes={stop.route_ids.map(id => props.routes.get(id)!)}
                    />
                ) : null}
                <div class="float-clear" />
            </div>
        );
    }
}
