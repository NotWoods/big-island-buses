import * as React from 'react';
import * as moment from 'moment';
import ScheduleRow, { ScheduleRowProps } from './ScheduleRow';
import TripHeader  from './TripHeader';
import SiblingTripLink from './SiblingTripLink';

export interface BasicScheduleListProps {
  route_id: string;
  route_days: Set<number>;
  items: ScheduleRowProps[];
  prev: {
    trip_id?: string;
    service_id?: string;
    trip_short_name?: string;
    trip_headsign?: string;
  } | null;
  next: {
    trip_id?: string;
    service_id?: string;
    trip_short_name?: string;
    trip_headsign?: string;
  } | null;
  current: {
    trip_id: string;
    trip_short_name?: string;
    trip_headsign?: string;
    service_id?: string;
    trip_range: moment.Range;
  };
}

/**
 * Displays a trip schedule
 */
const BasicScheduleList: React.SFC<BasicScheduleListProps> = props => (
  <div className="schedule-list-container">
    {props.prev ? <SiblingTripLink
      mode="prev"
      route_id={props.route_id}
      route_days={props.route_days}
      {...props.prev}
    /> : null}
    <section className="schedule-list-main">
      <header className="current-trip-title">
        {props.current
          ? <TripHeader route_days={props.route_days} {...props.current} />
          : '...'}
      </header>
      <ul className="schedule-list">
        {props.items.map((item, index) => (
          <ScheduleRow key={index} {...item} />
        ))}
      </ul>
    </section>
    {props.next ? <SiblingTripLink
      mode="next"
      route_id={props.route_id}
      route_days={props.route_days}
      {...props.next}
    /> : null}
  </div>
);

export default BasicScheduleList;
