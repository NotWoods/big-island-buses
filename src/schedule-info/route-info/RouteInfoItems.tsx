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

    readonly stops?: Map<Stop['stop_id'], Stop>;
}

export const RouteInfoItems: FunctionalComponent<Props> = ({
    route,
    selectedTripId,
    closestTrip,
    stops = new Map<Stop['stop_id'], Stop>(),
}) => {
    return (
        <section class="schedule-info" id="information">
            <SelectTrip
                trips={Object.values(route.trips)}
                trip_id={selectedTripId}
            />
            <RouteLocationInfoItem
                firstStop={stops.get(route.first_stop)}
                lastStop={stops.get(route.last_stop)}
            />
            <RouteTimeInfoItem
                startTime={toTime(fromIsoTime(route.start_time))}
                endTime={toTime(fromIsoTime(route.end_time))}
            />
            <RouteWeekdaysInfoItem days={route.days} />
            <NextStopInfoItem
                nextStop={
                    closestTrip && closestTrip.stop_id
                        ? stops.get(closestTrip.stop_id)
                        : undefined
                }
                timeToArrival={closestTrip ? closestTrip.duration : undefined}
            />
        </section>
    );
};
