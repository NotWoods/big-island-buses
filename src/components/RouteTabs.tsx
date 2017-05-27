import * as React from 'react';
import Tabs from './Tabs';

const routeTabs = { schedule: 'Schedule', map: 'Map' };

interface RouteTabsProps {
  selected: 'schedule' | 'map';
  mapDisabled: boolean;
  onChange(newSelected: 'schedule' | 'map'): void;
}

/**
 * A pair of tabs ('Schedule' and 'Map') to display in a route
 * header.
 */
const RouteTabs: React.SFC<RouteTabsProps> = props => {
  return (
    <Tabs
      tabs={routeTabs as {}}
      selected={props.selected}
      onChange={props.onChange}
      disabled={props.mapDisabled ? ['disabled'] : undefined}
    />
  );
};

export default RouteTabs;
