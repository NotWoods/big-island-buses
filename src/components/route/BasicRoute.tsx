import * as React from 'react';
import * as moment from 'moment';
import { Trip } from 'query-pouch-gtfs';
import RouteHeader from './RouteHeader';
import Tabs from '../Tabs';
import ScheduleList from '../trip/ScheduleList';

import '../../css/route/Route.css';

interface BasicRouteProps {
  now?: moment.Moment;
  disableMap?: boolean;
  route_id: string;
  routeName: string;
  route_text_color?: string;
  route_color?: string;
  route_days?: Set<number>;
  currentTrip?: Trip;
}

interface BasicRouteState {
  infoPressed: boolean;
  selectedTab: 'schedule' | 'map';
}

const routeTabs = { schedule: 'Schedule', map: 'Map' };

export default class BasicRoute extends React.Component<BasicRouteProps, BasicRouteState> {
  constructor(props: BasicRouteProps) {
    super(props);
    this.state = { infoPressed: true, selectedTab: 'schedule' };
    this.handleInfoPress = this.handleInfoPress.bind(this);
  }

  handleInfoPress() {
    this.setState(state => ({ infoPressed: !state.infoPressed }));
  }

  handleTabChange(newSelected: 'schedule' | 'map') {
    this.setState({ selectedTab: newSelected });
  }

  render() {
    return (
      <article className="route">
        <header className="route-header-container">
          <RouteHeader
            route_id={this.props.route_id}
            routeName={this.props.routeName}
            route_text_color={this.props.route_text_color}
            route_color={this.props.route_color}
          >
            <Tabs
              tabs={routeTabs}
              selected={this.state.selectedTab}
              onChange={this.handleTabChange}
              disabled={this.props.disableMap ? ['map'] : undefined}
            />
          </RouteHeader>
        </header>
        {(this.props.currentTrip && this.props.route_days) ? <ScheduleList
          route_id={this.props.route_id}
          route_days={this.props.route_days}
          trip={this.props.currentTrip}
        /> : null}
      </article>
    );
  }
}
