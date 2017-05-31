import * as React from 'react';
import * as moment from 'moment';

import { Trip, StopTime } from 'gtfs-to-pouch/es/interfaces';
import { getTripSchedule, getStop, siblingTrips, scheduleRange, connectedRoutes } from 'gtfs-to-pouch/es/read';

import { useDatabase, DatabasesProps } from './DatabaseHOC';
import BasicScheduleList from './BasicScheduleList';
import { ScheduleRowProps } from './ScheduleRow';

export interface ScheduleListProps {
  route_id: string;
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

  async loadConnections(times: StopTime[]) {
    const _connectedRoutes = connectedRoutes(
      this.props.stopTimeDB,
      this.props.tripDB,
      this.props.routeDB,
    );
    const routesList = await Promise.all(times.map(time => _connectedRoutes(time.stop_id)));

    this.setState({
      items: this.state.items.map((item, index) => {
        const connections = routesList[index].map(route => ({
          route_id: route.route_id,
          route_color: route.route_color || '000',
          route_name: route.route_short_name || route.route_long_name,
        }));
        return { ...item, connections };
      })
    });
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
        stop_id: time.stop_id,
        stop_name: '...',
        time: moment(time.arrival_time, 'H:mm:ss'),
        connections: [],
      })),
    });

    this.loadStopNames(times);
    this.loadConnections(times);
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

export default useDatabase<ScheduleListProps>()(ScheduleList);
