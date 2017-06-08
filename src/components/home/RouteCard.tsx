import * as React from 'react';
import {
  getRouteName,
  Route,
} from 'query-pouch-gtfs';
import { getURL } from '../../utils';

interface RouteCardProps extends Route {
  imgSrc?: string;
}

interface RouteCardState {
  imgSrc: string;
}

/**
 * A card with an image representing a route, mainly to show on the
 * homepage.
 */
export default class RouteCard extends React.Component<RouteCardProps, RouteCardState> {
  constructor(props: RouteCardProps) {
    super(props);

    this.state = { imgSrc: '' };
  }

  componentDidMount() {
    this.loadDynamicImage();
  }

  async loadDynamicImage(): Promise<void> {
    // this.setState({ imgSrc: '' });
  }

  render() {
    const { route_id, route_color, imgSrc } = this.props;

    const style: React.CSSProperties = {};
    if (route_color) { style.background = `#${route_color}`; }

    return (
      <a className="route-card" href={getURL(route_id)}>
        <img
          src={imgSrc || this.state.imgSrc}
          alt=""
          className="route-card-background"
        />
        <h4 className="route-card-label">{getRouteName(this.props)}</h4>
        <div className="route-card-border" style={style} />
      </a>
    );
  }
}
