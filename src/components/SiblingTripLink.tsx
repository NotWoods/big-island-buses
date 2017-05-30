import * as React from 'react';
import * as moment from 'moment';
import { Weekdays } from 'gtfs-to-pouch/es/read';
import { getURL } from '../utils';
import TripHeader, { TripHeaderProps } from './TripHeader';

interface SiblingTripLinkProps {
  mode: 'prev' | 'next';
  route_id: string;
  trip_id?: string;
  service_id?: string;
  trip_short_name?: string;
  trip_headsign?: string;
  route_days: Set<Weekdays>;
  trip_days?: Set<Weekdays>;
  trip_range?: moment.Range;
}

/**
 * Displays a link to a sibling trip, meant to bookend a trip schedule.
 */
const SiblingTripLink: React.SFC<SiblingTripLinkProps> = ({ mode, route_id, ...props }) => {
  return (
    <div className={`change-trip ${mode}-trip`}>
      <i className="change-trip-icon" />
      <a className="change-trip-text" href={getURL(route_id, props.trip_id)}>
        {props.trip_id ? <TripHeader {...props as TripHeaderProps} /> : '...'}
      </a>
    </div>
  );
};

export default SiblingTripLink;
