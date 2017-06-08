import * as React from 'react';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import {
  getTripSchedule, getStop, siblingTrips, scheduleRange,
  Trip, StopTime,
} from 'query-pouch-gtfs';
import { useDatabase, DatabasesProps } from '../useDatabase';
import BasicScheduleList from './BasicScheduleList';
import { ScheduleRowProps } from './ScheduleRow';

import '../../css/trip/ScheduleList.css';

extendMoment(moment);

export interface ScheduleListProps {
  route_id: string;
  route_color: string;
  route_days: Set<number>;
  trip: Trip;
}

interface ScheduleListState {
  items: ScheduleRowProps[];
  prev: Trip | null;
  next: Trip | null;
  currentTripRange: moment.Range;
}

type PropsWithDB = ScheduleListProps & DatabasesProps;

/**
 * Header for a trip. Automatically loads additional trip data
 */
class ScheduleList extends React.Component<PropsWithDB, ScheduleListState> {
  constructor(props: PropsWithDB) {
    super(props);

    this.state = {
      items: [],
      prev: null,
      next: null,
      currentTripRange: moment.range(''),
    };
  }

  componentDidMount() {
    this.getItems(this.props.trip.trip_id);
    this.getTrips(this.props.trip);
  }

  componentWillReceiveProps(nextProps: ScheduleListProps) {
    if (nextProps.trip.trip_id !== this.props.trip.trip_id) {
      this.getItems(nextProps.trip.trip_id);
      this.getTrips(nextProps.trip);
    }
  }

  async loadStopNames(times: StopTime[]) {
    const _getStop = getStop(this.props.stopDB);
    const stops = await Promise.all(times.map(time => _getStop(time.stop_id)));

    this.setState({
      items: this.state.items.map((item, index) => ({
        ...item,
        stop_name: stops[index].stop_name,
      }))
    });
  }

  async getItems(tripID: string) {
    const times = await getTripSchedule(this.props.stopTimeDB)(tripID);
    this.setState({
      currentTripRange: scheduleRange(times),
      items: times.map(time => ({
        route_color: this.props.route_color,
        stop_id: time.stop_id,
        stop_name: '...',
        time: moment(time.arrival_time, 'H:mm:ss'),
        connections: [],
      })),
    });

    this.loadStopNames(times);
  }

  async getTrips(trip: Trip) {
    const {
      previous,
      following,
    } = await siblingTrips(this.props.tripDB, this.props.stopTimeDB)(trip);

    this.setState({
      prev: previous,
      next: following,
    });
  }

  render() {
    return (
      <BasicScheduleList
        route_id={this.props.route_id}
        route_days={this.props.route_days}
        items={this.state.items}
        current={this.props.trip}
        currentTripRange={this.state.currentTripRange}
        prev={this.state.prev}
        next={this.state.next}
      />
    );
  }
}

export default useDatabase<ScheduleListProps>('routes', 'trips', 'stops', 'stop_times')(ScheduleList);
