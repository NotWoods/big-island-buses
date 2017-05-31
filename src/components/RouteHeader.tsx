import * as React from 'react';

import InfoButton from './InfoButton';

interface RouteHeaderProps {
  routeName: string;
  route_text_color?: string;
  route_color?: string;
  infoPressed: boolean;
  onInfoPress: React.MouseEventHandler<HTMLButtonElement>;
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
    <div className="route-header" style={styles}>
      <h1 className="route-name">{props.routeName}</h1>

      <InfoButton pressed={props.infoPressed} onClick={props.onInfoPress} />
    </div>
  );
};

export default RouteHeader;
