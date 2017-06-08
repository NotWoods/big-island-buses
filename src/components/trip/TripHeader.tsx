import * as React from 'react';
import * as moment from 'moment';
import { getDays, tripTimes, Weekdays } from 'query-pouch-gtfs';
import { useDatabase, DatabasesProps } from '../useDatabase';
import BasicTripHeader from './BasicTripHeader';

export interface TripHeaderProps {
  trip_id: string;
  service_id?: string;
  trip_short_name?: string;
  trip_headsign?: string;
  route_days: Set<Weekdays>;
  trip_days?: Set<Weekdays>;
  trip_range?: moment.Range;
  className?: string;
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
    if (!this.props.trip_days) {
      this.loadDays(this.props.trip_id, this.props.service_id);
    }
    if (!this.props.trip_range) {
      this.loadRange(this.props.trip_id);
    }
  }

  componentWillReceiveProps(nextProps: TripHeaderProps) {
    if (nextProps.trip_id !== this.props.trip_id) {
      if (!nextProps.trip_days) {
        this.loadDays(nextProps.trip_id, nextProps.service_id);
      }
      if (!nextProps.trip_range) {
        this.loadRange(nextProps.trip_id);
      }
    } else if (nextProps.service_id !== this.props.service_id) {
      if (!nextProps.trip_days) {
        this.loadDays(nextProps.trip_id, nextProps.service_id);
      }
    }
  }

  async loadDays(tripID: string, serviceID?: string) {
    if (!serviceID) {
      console.warn(`Cannot load days for trip ${tripID} without a service_id`);
      return;
    }

    this.setState({ trip_days: null });

    const days = await getDays(this.props.calendarDB)(serviceID);

    this.setState({ trip_days: days });
  }

  async loadRange(tripID: string) {
    this.setState({ trip_range: null });

    const range = await tripTimes(this.props.stopTimeDB)(tripID);

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
        className={this.props.className}
      />
    );
  }
}

export default useDatabase<TripHeaderProps>('calendar', 'stop_times')(TripHeader);
