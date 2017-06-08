import * as React from 'react';
import RouteMapImage from './RouteMapImage';
import RouteInfoBox from './RouteInfoBox';

import '../../css/route/RouteHeader.css';

interface RouteHeaderProps {
  route_id: string;
  routeName: string;
  route_text_color?: string;
  route_color?: string;
  children?: React.ReactNode;
}

/**
 * Header to be shown on the top of the route screen
 */
const RouteHeader: React.SFC<RouteHeaderProps> = props => {
  const styles: React.CSSProperties = {
    backgroundColor: `#${props.route_color || '000'}`,
    color: `#${props.route_text_color || 'fff'}`,
  };

  return (
    <header className="route-header" style={styles}>
      <div className="route-header-top">
        <RouteMapImage
          width={64}
          height={64}
          route_id={props.route_id}
          apiKey=""
        />

        <div className="route-header-right">
          <h1 className="route-name">{props.routeName}</h1>
          <RouteInfoBox route_id={props.route_id} />
        </div>
      </div>
      {props.children}
    </header>
  );
};

export default RouteHeader;
