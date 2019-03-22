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

export const RouteInfo = (props: Props) => {
    let stop: Stop | null = null;
    if (props.stops && props.stop_id) {
        stop = props.stops[props.stop_id];
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
            <RouteScheduleInfo
                route_id={props.route_id}
                trip_id={props.trip_id}
                stops={props.stops}
                nowTime={props.nowTime}
            />
            {stop != null ? (
                <StopInfo stop={stop} routes={props.routes} />
            ) : null}
            <div class="float-clear" />
        </div>
    );
};
