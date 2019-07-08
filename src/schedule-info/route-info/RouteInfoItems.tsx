import { FunctionalComponent, h } from 'preact';
import { ClosestTripInfo } from '../../db/closest-trip';
import { RouteDetails, Stop, Trip } from '../../common/api-types';
import { fromIsoTime } from '../../common/parse-date';
import { toTime } from '../../common/Time';
import { NextStopInfoItem } from './NextStopInfoItem';
import { RouteLocationInfoItem } from './RouteLocationInfoItem';
import { RouteTimeInfoItem } from './RouteTimeInfoItem';
import { RouteWeekdaysInfoItem } from './RouteWeekdaysInfoItem';
import { SelectTrip } from './SelectTrip';

interface Props {
    readonly route: RouteDetails;
    readonly selectedTripId?: Trip['trip_id'];
    readonly closestTrip?: ClosestTripInfo;

    readonly stops: Record<string, Pick<Stop, 'stop_id' | 'name'>>;
}

export const RouteInfoItems: FunctionalComponent<Props> = props => {
    return (
        <section class="schedule-info" id="information">
            <SelectTrip
                trips={Object.values(props.route.trips)}
                trip_id={props.selectedTripId}
            />
            <RouteLocationInfoItem
                firstStop={props.stops[props.route.first_stop]}
                lastStop={props.stops[props.route.last_stop]}
            />
            <RouteTimeInfoItem
                startTime={toTime(fromIsoTime(props.route.start_time))}
                endTime={toTime(fromIsoTime(props.route.end_time))}
            />
            <RouteWeekdaysInfoItem days={props.route.days} />
            <NextStopInfoItem
                nextStop={
                    props.closestTrip && props.closestTrip.stop_id
                        ? props.stops[props.closestTrip.stop_id]
                        : undefined
                }
                timeToArrival={
                    props.closestTrip ? props.closestTrip.duration : undefined
                }
            />
        </section>
    );
};
