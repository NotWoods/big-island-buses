import * as React from 'react';
import { getRoute } from 'query-pouch-gtfs';
import { useDatabase, DatabasesProps } from './useDatabase';
import BasicConnectionLink from './BasicConnectionLink';

interface ConnectionLinkProps {
  showTitle?: boolean;
  route_id: string;
  stop_id?: string;
  className?: string;
  currentRouteID?: string;
}

interface ConnectionLinkState {
  route_color: string;
  route_text_color: string;
  routeName: string;
}

class ConnectionLink
extends React.Component<ConnectionLinkProps & DatabasesProps, ConnectionLinkState> {
  constructor(props: ConnectionLinkProps & DatabasesProps) {
    super(props);

    this.state = {
      route_color: '000',
      route_text_color: 'fff',
      routeName: '',
    };
  }

  componentDidMount() {
    this.loadRoute(this.props.route_id);
  }

  componentWillReceiveProps(nextProps: ConnectionLinkProps) {
    if (this.props.route_id !== nextProps.route_id) {
      this.loadRoute(nextProps.route_id);
    }
  }

  async loadRoute(routeID: string) {
    this.setState({
      route_color: '000',
      route_text_color: 'fff',
      routeName: '',
    });

    const route = await getRoute(this.props.routeDB)(routeID);

    this.setState({
      route_color: route.route_color || '000',
      route_text_color: route.route_text_color || 'fff',
      routeName: route.route_short_name || route.route_long_name,
    });
  }

  render() {
    return (
      <BasicConnectionLink
        showTitle={this.props.showTitle}
        route_id={this.props.route_id}
        currentRouteID={this.props.currentRouteID}
        stop_id={this.props.stop_id}
        route_color={this.state.route_color}
        route_text_color={this.state.route_text_color}
        route_name={this.state.routeName}
      />
    );
  }
}

export default useDatabase<ConnectionLinkProps>('routes')(ConnectionLink);
