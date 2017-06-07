import * as React from 'react';
import * as moment from 'moment';

import { dateRangeString, Weekdays } from 'query-pouch-gtfs';

export interface BasicTripHeaderProps {
  trip_id: string;
  trip_short_name?: string;
  trip_headsign?: string;
  route_days: Set<Weekdays>;
  trip_days: Set<Weekdays>;
  trip_range?: moment.Range;
}

function sameDays(a: Set<Weekdays>, b: Set<Weekdays>): boolean {
  if (a.size !== b.size) { return false; }
  let hasSameDays = true;
  a.forEach(day => {
    if (!b.has(day)) { hasSameDays = false; }
  });

  return hasSameDays;
}

/**
 * Header for a trip. Displays the trip direction, along with the time it runs.
 * If the service days differ from the standard for the route, then the altered
 * times are listed.
 */
const BasicTripHeader: React.SFC<BasicTripHeaderProps> = props => {
  let tripTime: React.ReactNode = null;
  if (props.trip_range) {
    const { start, end } = props.trip_range;
    tripTime = [
      <time key="start" dateTime={start.format('HH:mm')}>{start.format('h:mm a')}</time>,
      ' - ',
      <time key="end" dateTime={end.format('HH:mm')}>{end.format('h:mm a')}</time>,
    ];
  }

  const tripName = props.trip_short_name || props.trip_headsign || '';
  let tripDaysString = '';
  if (!sameDays(props.trip_days, props.route_days)) {
    tripDaysString = ' | ' + dateRangeString(props.trip_days);
  }

  return (
    <h2 className="trip-header">
      {tripName}
      {'('}
      {tripTime}
      {tripDaysString}
      {')'}
    </h2>
  );
};

export default BasicTripHeader;
