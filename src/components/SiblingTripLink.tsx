import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';
import { Weekdays } from 'gtfs-to-pouch/es/read';
import { setTrip } from '../redux/page';
import { getURL } from '../utils';
import TripHeader from './TripHeader';

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
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Displays a link to a sibling trip, meant to bookend a trip schedule.
 */
const SiblingTripLink: React.SFC<SiblingTripLinkProps> = props => {
  const { trip_id } = props;

  let headerText: React.ReactNode = '...';
  if (trip_id) {
    headerText = (
      <TripHeader
        trip_id={trip_id}
        service_id={props.service_id}
        trip_short_name={props.trip_short_name}
        trip_headsign={props.trip_headsign}
        route_days={props.route_days}
        trip_days={props.trip_days}
        trip_range={props.trip_range}
      />
    );
  }

  return (
    <div className={`change-trip ${props.mode}-trip`}>
      <i className="change-trip-icon" />
      <a
        className="change-trip-text"
        href={trip_id ? getURL(props.route_id, trip_id) : undefined}
        onClick={props.onClick}
      >
        {headerText}
      </a>
    </div>
  );
};

export default connect(
  null,
  (dispatch, { trip_id }: SiblingTripLinkProps) => {
    const onClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
      e.preventDefault();
      dispatch(setTrip(trip_id));
    };
    return { onClick };
  }
)(SiblingTripLink);
