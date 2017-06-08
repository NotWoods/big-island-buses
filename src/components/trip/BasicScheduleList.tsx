import * as React from 'react';
import * as moment from 'moment';
import { Trip } from 'query-pouch-gtfs';
import ScheduleRow, { ScheduleRowProps } from './ScheduleRow';
import TripHeader  from './TripHeader';
import SiblingTripLink from './SiblingTripLink';

export interface BasicScheduleListProps {
  route_id: string;
  route_days: Set<number>;
  items: ScheduleRowProps[];
  prev: Trip | null;
  next: Trip | null;
  current: Trip;
  currentTripRange: moment.Range;
}

/**
 * Displays a trip schedule
 */
const BasicScheduleList: React.SFC<BasicScheduleListProps> = props => {
  const { prev, next, current } = props;
  return (
    <div className="schedule-list-container">
      {prev ? <SiblingTripLink
        mode="prev"
        route_id={props.route_id}
        trip_id={prev.trip_id}
        service_id={prev.service_id}
        trip_short_name={prev.trip_short_name}
        trip_headsign={prev.trip_headsign}
        route_days={props.route_days}
      /> : null}
      <section className="schedule-list-main">
        <header className="current-trip-title">
          {current ? <TripHeader
            trip_id={current.trip_id}
            service_id={current.service_id}
            trip_short_name={current.trip_short_name}
            trip_headsign={current.trip_headsign}
            route_days={props.route_days}
            trip_range={props.currentTripRange}
          /> : '...'}
        </header>
        <ul className="schedule-list">
          {props.items.map((item, index) => (
            <ScheduleRow key={index} {...item} />
          ))}
        </ul>
      </section>
      {next ? <SiblingTripLink
        mode="next"
        route_id={props.route_id}
        trip_id={next.trip_id}
        service_id={next.service_id}
        trip_short_name={next.trip_short_name}
        trip_headsign={next.trip_headsign}
        route_days={props.route_days}
      /> : null}
    </div>
  );
};

export default BasicScheduleList;
