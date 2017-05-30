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
}

interface RouteState {
  route_long_name: string;
  route_short_name: string;
  route_text_color?: string;
  route_color?: string;
  route_days?: Set<number>;
  trip?: Trip;
}

class Route extends React.Component<RouteProps & DatabasesProps, RouteState> {
  constructor(props: RouteProps & DatabasesProps) {
    super(props);
    this.state = {
      route_long_name: '',
      route_short_name: '',
    };

    this.handleTripChange = this.handleTripChange.bind(this);
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

  async loadRoute() {
    this.setState({
      route_long_name: '',
      route_short_name: '',
      route_text_color: undefined,
      route_color: undefined,
    });

    const route = await getRoute(this.props.routeDB)(this.props.route_id);
    this.setState({
      route_long_name: route.route_long_name,
      route_short_name: route.route_short_name,
      route_text_color: route.route_text_color,
      route_color: route.route_color,
    });
  }

  async loadDays() {
    this.setState({ route_days: undefined });
    const days = await routeDays(this.props.tripDB, this.props.calendarDB)(this.props.route_id);
    this.setState({ route_days: days });
  }

  async loadCurrentTrip() {
    this.setState({ trip: undefined });
    const trip = await currentTrip(this.props.tripDB, this.props.stopTimeDB)(this.props.route_id);
    this.setState({ trip });
  }

  render() {
    return (
      <BasicRoute
        now={this.props.now}
        disableMap={this.props.disableMap}
        route_id={this.props.route_id}
        route_long_name={this.state.route_long_name}
        route_short_name={this.state.route_short_name}
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
