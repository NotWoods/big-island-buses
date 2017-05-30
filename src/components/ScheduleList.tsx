import * as React from 'react';
import * as moment from 'moment';

import { StopTime } from 'gtfs-to-pouch/es/interfaces';
import { getTrip, getTripSchedule, getStop, siblingTrips, scheduleRange, connectedRoutes } from 'gtfs-to-pouch/es/read';

import { useDatabase, DatabasesProps } from './DatabaseHOC';
import BasicScheduleList from './BasicScheduleList';
import { ScheduleRowProps } from './ScheduleRow';

export interface ScheduleListProps {
  route_id: string;
  route_days: Set<number>;
  trip_id: string;
}

interface ScheduleListState {
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
    trip_short_name?: string;
    trip_headsign?: string;
    service_id?: string;
    trip_range: moment.Range;
  };
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
      current: {
        trip_range: moment.range(''),
      },
    };
  }

  componentDidMount() {
    this.getItems();
    this.getTrips();
  }

  componentWillReceiveProps(nextProps: ScheduleListProps) {
    if (nextProps.trip_id !== this.props.trip_id) {
      this.getItems();
      this.getTrips();
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

  async getItems() {
    const times = await getTripSchedule(this.props.stopTimeDB)(this.props.trip_id);
    this.setState({
      current: {
        ...this.state.current,
        trip_range: scheduleRange(times),
      },
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

  async getTrips() {
    const current = await getTrip(this.props.tripDB)(this.props.trip_id, this.props.route_id);
    this.setState({
      current: {
        trip_short_name: current.trip_short_name,
        trip_headsign: current.trip_headsign,
        service_id: current.service_id,
        trip_range: this.state.current.trip_range,
      },
    });

    const {
      previous,
      following,
    } = await siblingTrips(this.props.tripDB, this.props.stopTimeDB)(current);

    this.setState({
      prev: previous ? {
        trip_id: previous.trip_id,
        service_id: previous.service_id,
        trip_short_name: previous.trip_short_name,
        trip_headsign: previous.trip_headsign,
      } : null,
      next: following ? {
        trip_id: following.trip_id,
        service_id: following.service_id,
        trip_short_name: following.trip_short_name,
        trip_headsign: following.trip_headsign,
      } : null,
    });
  }

  render() {
    return (
      <BasicScheduleList
        route_id={this.props.route_id}
        route_days={this.props.route_days}
        items={this.state.items}
        current={{
          ...this.state.current,
          trip_id: this.props.trip_id,
        }}
        prev={this.state.prev}
        next={this.state.next}
      />
    );
  }
}

export default useDatabase<ScheduleListProps>()(ScheduleList);
