import * as React from 'react';
import { Route } from 'query-pouch-gtfs';
import BasicConnectionLink from '../BasicConnectionLink';
import StopStreetView from './StopStreetView';
import StopName from './StopName';
import StopAddressInfo from './StopAddressInfo';

export interface BasicStopProps {
  stop_id: string;
  stop_name: string;
  stop_lat?: number;
  stop_lon?: number;
  routes: Route[];
  currentRouteID?: string;
}

const BasicStop: React.SFC<BasicStopProps> = props => {
  let streetView = <div style={{ width: '450px', height: '225px' }} />;
  if (props.stop_lat != null && props.stop_lon != null) {
    streetView = (
      <StopStreetView
        stop_lat={props.stop_lat}
        stop_lon={props.stop_lon}
        width={450}
        height={225}
        apiKey=""
      />
    );
  }

  return (
    <article className="list">
      <header className="info stop-info">
        {streetView}

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
              currentRouteID={props.currentRouteID}
            />
          </li>
        ))}
      </ul>
    </article>
  );
};

export default BasicStop;
