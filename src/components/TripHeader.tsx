import * as React from 'react';
import * as moment from 'moment';

import { getDays, tripTimes, Weekdays } from 'gtfs-to-pouch/es/read';

import { useDatabase, DatabasesProps } from './DatabaseHOC';
import BasicTripHeader from './BasicTripHeader';

export interface TripHeaderProps {
  trip_id: string;
  service_id?: string;
  trip_short_name?: string;
  trip_headsign?: string;
  route_days: Set<Weekdays>;
  trip_days?: Set<Weekdays>;
  trip_range?: moment.Range;
}

interface TripHeaderState {
  trip_days: Set<Weekdays> | null;
  trip_range: moment.Range | null;
}

type PropsWithDB = TripHeaderProps & DatabasesProps;

/**
 * Header for a trip. Automatically loads additional trip data
 */
class TripHeader extends React.Component<PropsWithDB, TripHeaderState> {
  constructor(props: PropsWithDB) {
    super(props);

    this.state = {
      trip_days: null,
      trip_range: null,
    };
  }

  componentDidMount() {
    if (!this.props.trip_days) { this.loadDays(); }
    if (!this.props.trip_range) { this.loadRange(); }
  }

  componentWillReceiveProps(nextProps: TripHeaderProps) {
    if (nextProps.trip_id !== this.props.trip_id) {
      if (!nextProps.trip_days) { this.loadDays(); }
      if (!nextProps.trip_range) { this.loadRange(); }
    } else if (nextProps.service_id !== this.props.service_id) {
      if (!nextProps.trip_days) { this.loadDays(); }
    }
  }

  async loadDays() {
    if (!this.props.service_id) {
      console.warn(`Cannot load days for trip ${this.props.trip_id} without a service_id`);
      return;
    }

    this.setState({ trip_days: null });

    const days = await getDays(this.props.calendarDB)(this.props.service_id);

    this.setState({ trip_days: days });
  }

  async loadRange() {
    this.setState({ trip_range: null });

    const range = await tripTimes(this.props.stopTimeDB)(this.props.trip_id);

    this.setState({ trip_range: range });
  }

  render() {
    return (
      <BasicTripHeader
        trip_id={this.props.trip_id}
        trip_short_name={this.props.trip_short_name}
        trip_headsign={this.props.trip_headsign}
        route_days={this.props.route_days}
        trip_range={this.state.trip_range || this.props.trip_range}
        trip_days={this.props.trip_days || this.state.trip_days || this.props.route_days}
      />
    );
  }
}

export default useDatabase<TripHeaderProps>('calendar', 'stop_times')(TripHeader);
