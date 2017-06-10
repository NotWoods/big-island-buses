import * as React from 'react';
import * as moment from 'moment';
import {
  getRoute, routeDays,
  Trip,
} from 'query-pouch-gtfs';
import { useDatabase, DatabasesProps } from '../useDatabase';
import BasicRoute from './BasicRoute';

interface RouteWithTripProps {
  now?: moment.Moment;
  disableMap?: boolean;
  route_id: string;
  trip: Trip | null;
  routeName?: string;
  route_text_color?: string;
  route_color?: string;
}

interface RouteWithTripState {
  routeName: string;
  route_text_color?: string;
  route_color?: string;
  route_days?: Set<number>;
}

class RouteWithTrip
extends React.Component<RouteWithTripProps & DatabasesProps, RouteWithTripState> {
  constructor(props: RouteWithTripProps & DatabasesProps) {
    super(props);
    this.state = {
      routeName: '',
    };
  }

  componentDidMount() {
    this.loadDays(this.props.route_id);
    if (!this.props.routeName && !this.props.route_color && !this.props.route_text_color) {
      this.loadRoute(this.props.route_id);
    }
  }

  componentWillReceiveProps(nextProps: RouteWithTripProps) {
    if (nextProps.route_id !== this.props.route_id) {
      this.loadDays(nextProps.route_id);
      if (!nextProps.routeName && !nextProps.route_color && !nextProps.route_text_color) {
        this.loadRoute(nextProps.route_id);
      }
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
        currentTrip={this.props.trip || undefined}
      />
    );
  }
}

export default useDatabase<RouteWithTripProps>('routes', 'trips', 'calendar')
  (RouteWithTrip);
