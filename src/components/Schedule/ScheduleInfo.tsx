import memoizeOne from 'memoize-one';
import { Component, h } from 'preact';
import { BASE_URL } from '../../config';
import {
    RouteDetails,
    Stop,
    Trip,
    Weekdays,
} from '../../server-render/api-types';
import { fromIsoTime } from '../../server-render/parse-date';
import { TimeData, toDuration, toTime } from '../Time';
import { NextStop } from './NextStop';
import { RouteLocation } from './RouteLocation';
import { RouteTime } from './RouteTime';
import { RouteWeekdays } from './RouteWeekdays';
import { ScheduleTimes } from './ScheduleTimes';
import { SelectTrip } from './SelectTrip';

interface ScheduleInfoProps {
    route_id?: string | null;
    trip_id?: string | null;
    name: string;
    color: string;
    text_color: string;
    trips?: Record<string, Pick<Trip, 'trip_id' | 'name' | 'stop_times'>>;
    first_stop: string;
    last_stop: string;
    start_time: string;
    end_time: string;
    days: Weekdays;
    stops?: Record<string, Pick<Stop, 'stop_id' | 'name'>>;
    nowTime?: TimeData;
}

const closestTrip = memoizeOne(
    (
        trips: Pick<Trip, 'trip_id' | 'name' | 'stop_times'>[],
        nowTime?: TimeData,
    ) => {
        const now = nowTime ? fromIsoTime(nowTime.iso) : null;
        let closestTrip: string = '';
        let closestTripTime = Number.MAX_VALUE;
        let closestTripStop: string | null = null;
        let earliestTrip: string = '';
        let earliestTripTime = Number.MAX_VALUE;
        let earliestTripStop: string | null = null;
        for (const trip of trips) {
            for (const stop of trip.stop_times) {
                const time = fromIsoTime(stop.time).getTime();
                if (now) {
                    const duration = time - now.getTime();
                    if (duration < closestTripTime && duration > 0) {
                        closestTripTime = duration;
                        closestTrip = trip.trip_id;
                        closestTripStop = stop.stop_id;
                    }
                }
                if (time < earliestTripTime) {
                    earliestTripTime = time;
                    earliestTrip = trip.trip_id;
                    earliestTripStop = stop.stop_id;
                }
            }
        }
        if (!closestTrip) {
            closestTripTime = now ? earliestTripTime - now.getTime() : Infinity;
            closestTrip = earliestTrip;
            closestTripStop = earliestTripStop;
        }
        const minute = Math.floor(closestTripTime / 60000);
        const nextStopDuration = toDuration({ minute });

        return {
            trip_id: closestTrip,
            stop_id: closestTripStop,
            duration: nextStopDuration,
        };
    },
);

export const ScheduleInfo = (props: ScheduleInfoProps) => {
    const trips = props.trips ? Object.values(props.trips) : [];

    const closest = closestTrip(trips, props.nowTime);

    const currentTrip =
        props.trips && props.trips[props.trip_id!]
            ? props.trip_id!
            : closest.trip_id;
    const stops: Partial<ScheduleInfoProps['stops']> = props.stops || {};
    return (
        <div id="schedule-column">
            <section class="schedule-info" id="information">
                <SelectTrip trips={trips} trip_id={currentTrip} />
                <RouteLocation
                    firstStop={stops[props.first_stop]}
                    lastStop={stops[props.last_stop]}
                />
                <RouteTime
                    startTime={toTime(fromIsoTime(props.start_time))}
                    endTime={toTime(fromIsoTime(props.end_time))}
                />
                <RouteWeekdays days={props.days} />
                <NextStop
                    nextStop={
                        closest.stop_id ? stops[closest.stop_id] : undefined
                    }
                    timeToArrival={closest.duration}
                />
            </section>
            <ScheduleTimes
                stopTimes={
                    props.trips ? props.trips[currentTrip].stop_times : []
                }
                color={props.color}
                stops={props.stops}
            />
        </div>
    );
};

type Props = Pick<
    ScheduleInfoProps,
    'route_id' | 'trip_id' | 'stops' | 'nowTime'
>;

interface State {
    route: RouteDetails | null;
}

export class RouteScheduleInfo extends Component<Props, State> {
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
        if (state.route == null) return null;
        return (
            <ScheduleInfo
                {...state.route}
                trip_id={props.trip_id}
                stops={props.stops}
                nowTime={props.nowTime}
            />
        );
    }
}
