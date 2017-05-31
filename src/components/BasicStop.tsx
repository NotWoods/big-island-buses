import * as React from 'react';
import { Route } from 'gtfs-to-pouch/es/interfaces';
import StopStreetView from './StopStreetView';
import StopName from './StopName';
import StopAddressInfo from './StopAddressInfo';
import BasicConnectionLink from './BasicConnectionLink';

export interface BasicStopProps {
  stop_id: string;
  stop_name: string;
  stop_lat?: number;
  stop_lon?: number;
  routes: Route[];
}

const BasicStop: React.SFC<BasicStopProps> = props => (
  <article className="list">
    <header className="info stop-info">
      <StopStreetView
        stop_lat={props.stop_lat}
        stop_lon={props.stop_lon}
        width={600}
        height={400}
      />

      <StopName>{props.stop_name}</StopName>

      <div className="info-box">
        <StopAddressInfo
          lat={props.stop_lat}
          lng={props.stop_lon}
          id={props.stop_id}
        />
      </div>
    </header>

    <h3 className="route-list-header">Connects to</h3>
    <ul className="route-list">
      {props.routes.map(route => (
        <li className="route-list-item">
          <BasicConnectionLink
            showTitle={true}
            route_id={route.route_id}
            stop_id={props.stop_id}
            route_color={route.route_color || '000'}
            route_text_color={route.route_text_color || 'fff'}
            route_name={route.route_short_name || route.route_long_name}
          />
        </li>
      ))}
    </ul>
  </article>
);

export default BasicStop;
