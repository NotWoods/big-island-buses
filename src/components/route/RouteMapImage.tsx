import * as React from 'react';
import {
  allStopsInRoute, getStopCoordinates,
} from 'query-pouch-gtfs';
import { useDatabase, DatabasesProps } from '../useDatabase';

interface RouteMapImageProps {
  apiKey: string;
  width: number;
  height: number;
  route_id: string;
}

interface RouteMapImageState {
  markerList: string;
}

class RouteMapImage
extends React.Component<RouteMapImageProps & DatabasesProps, RouteMapImageState> {
  constructor(props: RouteMapImageProps & DatabasesProps) {
    super(props);
    this.state = {
      markerList: ''
    };
  }

  componentDidMount() {
    this.loadMarkerList(this.props.route_id);
  }

  componentWillReceiveProps(nextProps: RouteMapImageProps) {
    if (nextProps.route_id !== this.props.route_id) {
      this.loadMarkerList(nextProps.route_id);
    }
  }

  async loadMarkerList(routeID: string) {
    this.setState({ markerList: '' });

    const stopIDs = await allStopsInRoute(
      this.props.tripDB, this.props.stopTimeDB
    )(routeID);

    const coordinates = await Promise.all(
      stopIDs.map(getStopCoordinates(this.props.stopDB))
    );

    const markerList = coordinates
      .map(coords => coords.reverse().join())
      .join('|');

    this.setState({ markerList });
  }

  getSrc(): string {
    if (!this.state.markerList) { return ''; }

    return 'https://maps.googleapis.com/maps/api/staticmap'
      + `?size=${this.props.width}x${this.props.height}`
      + `&markers=size:tiny|${this.state.markerList}`
      + `&key=${this.props.apiKey}`;
  }

  render() {
    return (
      <img
        className="route-map-image"
        src={this.getSrc()}
        width={this.props.width}
        height={this.props.height}
        alt="Small route map"
      />
    );
  }
}

export default useDatabase<RouteMapImageProps>('trips', 'stop_times', 'stops')(RouteMapImage);
