import memoizeOne from 'memoize-one';
import { Component, h } from 'preact';
import { TimeData, toDuration } from '../../common/Time';
import { BASE_URL } from '../../config';
import { RouteDetails, Stop, Trip } from '../../common/api-types';
import { fromIsoTime } from '../../common/parse-date';
import { RouteInfoItems } from './RouteInfoItems';
import { ScheduleTimes } from './ScheduleTimes';

const closestTrip = memoizeOne(
    (trips: RouteDetails['trips'], nowTime?: TimeData) => {
        const now = nowTime ? fromIsoTime(nowTime.iso) : null;
        let closestTrip: string = '';
        let closestTripTime = Number.MAX_VALUE;
        let closestTripStop: string | undefined;
        let earliestTrip: string = '';
        let earliestTripTime = Number.MAX_VALUE;
        let earliestTripStop: string | undefined;
        for (const trip of Object.values(trips)) {
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

interface Props {
    readonly routeId?: RouteDetails['route_id'];
    readonly selectedTripId?: Trip['trip_id'];

    readonly stops?: Map<Stop['stop_id'], Stop>;
    readonly nowTime?: TimeData;
}

interface State {
    route?: RouteDetails;
}

export class RouteInfo extends Component<Props, State> {
    async fetchRouteData() {
        if (this.props.routeId == null) {
            this.setState({ route: undefined });
        } else {
            const res = await fetch(
                `${BASE_URL}/api/routes/${this.props.routeId}.json`,
            );
            const details: RouteDetails = await res.json();
            this.setState({ route: details });
        }
    }

    componentDidMount() {
        this.fetchRouteData();
    }
    componentDidUpdate(prevProps: Props) {
        if (prevProps.routeId !== this.props.routeId) this.fetchRouteData();
    }

    render(props: Props, { route }: State) {
        if (route == null) return null;

        const closest = closestTrip(route.trips, props.nowTime);
        const selectedTripId =
            route.trips && route.trips[props.selectedTripId!]
                ? props.selectedTripId!
                : closest.trip_id;
        const selectedTrip = route.trips[selectedTripId];

        return (
            <div id="schedule-column">
                <RouteInfoItems
                    route={route}
                    selectedTripId={selectedTripId}
                    closestTrip={closest}
                    stops={props.stops}
                />
                <ScheduleTimes
                    stopTimes={selectedTrip ? selectedTrip.stop_times : []}
                    color={route.color}
                    stops={props.stops}
                />
            </div>
        );
    }
}
