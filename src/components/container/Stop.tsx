import * as React from 'react';

import {
  getStop, connectedRoutes
  Route,
} from 'query-pouch-gtfs';

import { useDatabase, DatabasesProps } from './DatabaseHOC';
import BasicStop from '../presentational/Stop';

interface StopProps {
  stop_id: string;
}

interface StopState {
  stop_name: string;
  stop_lat?: number;
  stop_lon?: number;
  fallbackURL: string;
  routes: Route[];
}

class Stop extends React.Component<StopProps & DatabasesProps, StopState> {
  constructor(props: StopProps & DatabasesProps) {
    super(props);
    this.state = {
      stop_name: '',
      fallbackURL: '',
      routes: [],
    };
  }

  componentDidMount() {
    this.loadStop(this.props.stop_id);
    this.loadConnections(this.props.stop_id);
  }

  componentWillReceiveProps(nextProps: StopProps) {
    if (nextProps.stop_id !== this.props.stop_id) {
      this.loadStop(nextProps.stop_id);
      this.loadConnections(nextProps.stop_id);
    }
  }

  async loadStop(stopID: string) {
    this.setState({
      stop_name: '',
      stop_lat: undefined,
      stop_lon: undefined,
    });

    const stop = await getStop(this.props.stopDB)(stopID);
    this.setState({
      stop_name: stop.stop_name,
      stop_lat: stop.stop_lat,
      stop_lon: stop.stop_lon,
    });
  }

  async loadConnections(stopID: string) {
    this.setState({ routes: [] });

    const routes = await connectedRoutes(
      this.props.stopTimeDB, this.props.tripDB, this.props.routeDB
    )(stopID);

    this.setState({ routes });
  }

  render() {
    return (
      <BasicStop
        stop_id={this.props.stop_id}
        stop_name={this.state.stop_name}
        stop_lat={this.state.stop_lat}
        stop_lon={this.state.stop_lon}
        routes={this.state.routes}
      />
    );
  }
}

export default useDatabase<StopProps>('routes', 'trips', 'stops', 'stop_times')(Stop);
