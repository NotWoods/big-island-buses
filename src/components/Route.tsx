import * as React from 'react';
import * as moment from 'moment';

import { getRoute, routeDays, currentTrip, getTrip } from 'gtfs-to-pouch/es/read';
import { Trip } from 'gtfs-to-pouch/es/interfaces';

import { useDatabase, DatabasesProps } from './DatabaseHOC';
import BasicRoute from './BasicRoute';

interface RouteProps {
  now?: moment.Moment;
  disableMap?: boolean;
  route_id: string;
  trip?: Trip;
  routeName?: string;
  route_text_color?: string;
  route_color?: string;
}

interface RouteState {
  routeName: string;
  route_text_color?: string;
  route_color?: string;
  route_days?: Set<number>;
  trip?: Trip;
}

class Route extends React.Component<RouteProps & DatabasesProps, RouteState> {
  constructor(props: RouteProps & DatabasesProps) {
    super(props);
    this.state = {
      routeName: '',
    };

    this.handleTripChange = this.handleTripChange.bind(this);
  }

  componentDidMount() {
    this.loadDays(this.props.route_id);
    if (!this.props.routeName && !this.props.route_color && !this.props.route_text_color) {
      this.loadRoute(this.props.route_id);
    }
    if (!this.props.trip) {
      this.loadCurrentTrip(this.props.route_id);
    }
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    if (nextProps.route_id !== this.props.route_id) {
      this.loadDays(nextProps.route_id);
      if (!nextProps.routeName && !nextProps.route_color && !nextProps.route_text_color) {
        this.loadRoute(nextProps.route_id);
      }
      if (!nextProps.trip) {
        this.loadCurrentTrip(nextProps.route_id);
      }
    }
  }

  async handleTripChange(newTrip: string | Trip) {
    if (typeof newTrip === 'string') {
      this.setState({ trip: undefined });
      const trip = await getTrip(this.props.tripDB)(newTrip, this.props.route_id);
      this.setState({ trip });
    } else {
      this.setState({ trip: newTrip });
    }
  }

  async loadRoute(routeID: string) {
    this.setState({
      routeName: '',
      route_text_color: undefined,
      route_color: undefined,
    });

    const route = await getRoute(this.props.routeDB)(routeID);
    this.setState({
      routeName: route.route_long_name || route.route_short_name,
      route_text_color: route.route_text_color,
      route_color: route.route_color,
    });
  }

  async loadDays(routeID: string) {
    this.setState({ route_days: undefined });
    const days = await routeDays(this.props.tripDB, this.props.calendarDB)(routeID);
    this.setState({ route_days: days });
  }

  async loadCurrentTrip(routeID: string) {
    this.setState({ trip: undefined });
    const trip = await currentTrip(this.props.tripDB, this.props.stopTimeDB)(routeID, this.props.now);
    this.setState({ trip });
  }

  render() {
    return (
      <BasicRoute
        now={this.props.now}
        disableMap={this.props.disableMap}
        route_id={this.props.route_id}
        routeName={this.state.routeName}
        route_text_color={this.state.route_text_color}
        route_color={this.state.route_color}
        route_days={this.state.route_days}
        currentTrip={this.props.trip || this.state.trip}
        changeTrip={this.handleTripChange}
      />
    );
  }
}

export default useDatabase<RouteProps>()(Route);
