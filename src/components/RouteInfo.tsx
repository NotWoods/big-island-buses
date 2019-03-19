import { Component, h } from 'preact';
import { RouteDetails, Stop } from '../server-render/api-types';
import { RouteHeader } from './RouteHeader';
import { ScheduleInfo } from './Schedule';
import { TimeData } from './Time';

interface Props {
    key: string;
    route_id: string;
    trip_id?: string | null;
    stops: Record<string, Pick<Stop, 'stop_id' | 'name'>>;
    nowTime: TimeData;
    name: string;
    color: string;
    text_color: string;
}

interface State {
    route: RouteDetails | null;
}

export class App extends Component<Props, State> {
    async componentDidUpdate(prevProps: Props) {
        if (prevProps.route_id !== this.props.route_id) {
            const res = await fetch(`api/${this.props.route_id}.json`);
            const details: RouteDetails = await res.json();
            this.setState({ route: details });
        }
    }

    render(props: Props, state: State) {
        return (
            <div id="content">
                <RouteHeader
                    name={props.name}
                    color={props.color}
                    textColor={props.text_color}
                />
                {state.route != null ? (
                    <ScheduleInfo
                        {...state.route}
                        trip_id={props.trip_id}
                        stops={props.stops}
                        nowTime={props.nowTime}
                    />
                ) : null}
                <div class="float-clear" />
            </div>
        );
    }
}
