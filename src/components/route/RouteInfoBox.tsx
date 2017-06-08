import * as React from 'react';
import * as moment from 'moment';
import {
  firstAndLastStop, nextStopOfRoute, getStop, currentTrip,
  StopTime, Stop,
} from 'query-pouch-gtfs';
import { useDatabase, DatabasesProps } from '../useDatabase';
import BusRouteInfo from './BusRouteInfo';
import NextStopInfo from './NextStopInfo';

import '../../css/InfoBox.css';

interface RouteInfoBoxProps {
  route_id: string;
  now?: moment.Moment;
}

interface RouteInfoBoxState {
  location: {
    first_stop_id: string,
    first_stop_name: string,
    last_stop_id: string
    last_stop_name: string,
  } | null;
  nextStop: {
    stop_name: string,
    stop_id: string,
    arrival_time: moment.Moment,
  } | null;
}

type PropsWithDB = RouteInfoBoxProps & DatabasesProps;

/**
 * An info box displaying some data relevant to the route.
 */
class RouteInfoBox extends React.Component<PropsWithDB, RouteInfoBoxState> {
  getStop: (stopID: string) => Promise<Stop>;
  nextStopOfRoute: (routeID: string) => Promise<StopTime>;

  constructor(props: PropsWithDB) {
    super(props);

    this.getStop = getStop(props.stopDB);
    this.nextStopOfRoute = nextStopOfRoute(props.tripDB, props.stopTimeDB);
  }

  componentDidMount() {
    this.loadAsyncData();
  }

  componentWillReceiveProps(nextProps: RouteInfoBoxProps) {
    if (nextProps.route_id !== this.props.route_id) {
      this.loadAsyncData();
    }
  }

  async loadAsyncData() {
    const routeID = this.props.route_id;
    await Promise.all([
      this.nextStopInfo(routeID),
      this.locationInfo(routeID),
    ]);
  }

  async nextStopInfo(routeID: string) {
    this.setState({ nextStop: null });

    const stopTime = await this.nextStopOfRoute(routeID);
    const stop_id = stopTime.stop_id;
    const arrival_time = moment(stopTime.arrival_time, 'H:mm:ss');

    this.setState({
      nextStop: { stop_id, arrival_time, stop_name: '___' }
    });

    const stop = await this.getStop(stop_id);

    this.setState({
      nextStop: { stop_id, arrival_time, stop_name: stop.stop_name }
    });
  }

  async locationInfo(routeID: string) {
    this.setState({ location: null });

    const current = await currentTrip(this.props.tripDB, this.props.stopTimeDB)(routeID);
    const {
      first_stop_id,
      last_stop_id,
    } = await firstAndLastStop(this.props.stopTimeDB)(current.trip_id);

    const [firstStop, lastStop] = await Promise.all([
      this.getStop(first_stop_id), this.getStop(last_stop_id)
    ]);

    this.setState({
      location: {
        first_stop_id,
        first_stop_name: firstStop.stop_name,
        last_stop_id,
        last_stop_name: lastStop.stop_name,
      },
    });
  }

  render() {
    return (
      <div className="info-box">
        <BusRouteInfo location={this.state.location} />
        <NextStopInfo nextStop={this.state.nextStop} now={this.props.now} />
      </div>
    );
  }
}

export default useDatabase<RouteInfoBoxProps>('trips', 'stops', 'stop_times')(RouteInfoBox);
