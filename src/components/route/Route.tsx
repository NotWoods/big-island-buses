import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';
import {
  currentTrip, getTrip,
  Trip,
} from 'query-pouch-gtfs';
import { ReduxState } from '../../redux/store';
import { useDatabase, DatabasesProps } from '../useDatabase';
import RouteWithTrip from './RouteWithTrip';

interface RouteProps {
  now?: moment.Moment;
  disableMap?: boolean;
  route_id: string;
  trip_id?: string;
  routeMeta?: {
    name: string;
    text_color?: string;
    color?: string;
  };
}

interface RouteState {
  trip: Trip | null;
}

class Route extends React.Component<RouteProps & DatabasesProps, RouteState> {
  constructor(props: RouteProps & DatabasesProps) {
    super(props);
    this.state = {
      trip: null,
    };
  }

  componentDidMount() {
    this.loadTrip(this.props.route_id, this.props.trip_id);
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    if (nextProps.route_id !== this.props.route_id
    || nextProps.trip_id !== this.props.trip_id) {
      this.loadTrip(nextProps.route_id, nextProps.trip_id);
    }
  }

  async loadTrip(routeID: string, tripID?: string) {
    if (!routeID) { return; }
    this.setState({ trip: null });

    let trip: Trip;
    if (tripID) {
      trip = await getTrip(this.props.tripDB)(tripID, routeID);
    } else {
      trip = await currentTrip(this.props.tripDB, this.props.stopTimeDB)(routeID, this.props.now);
    }

    this.setState({ trip });
  }

  render() {
    if (!this.props.route_id) { return null; }

    return (
      <RouteWithTrip
        now={this.props.now}
        disableMap={this.props.disableMap}
        route_id={this.props.route_id}
        trip={this.state.trip}
      />
    );
  }
}

const RouteWrapped: React.ComponentClass<Partial<RouteProps>> = connect(
  (state: ReduxState) => ({
    route_id: state.page.route_id,
    trip_id: state.page.trip_id,
    routeMeta: state.page.routeMeta,
    disableMap: !state.map.working,
  })
)(useDatabase<RouteProps>('trips', 'stop_times')(Route));

export default RouteWrapped;
