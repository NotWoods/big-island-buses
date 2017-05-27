import * as React from 'react';
import * as moment from 'moment';
import SearchButton from './SearchButton';
import InfoButton from './InfoButton';

interface RouteToolbarProps {
  trip_start: moment.Moment | null;
  route_name: string;
  infoPressed: boolean;
  onSearchClick(): void;
  onInfoClick(): void;
}

/**
 * Toolbar to be shown on the top of the route screen
 */
const RouteToolbar: React.SFC<RouteToolbarProps> = props => {
  let tripHeader: React.ReactNode = null;
  if (props.trip_start) {
    tripHeader = (
      <h2 className="trip-header">
        {moment(props.trip_start).format('h:mm a')}
      </h2>
    );
  }

  return (
    <header className="toolbar route-toolbar">
      <div className="route-toolbar-top">
        {tripHeader}
        <SearchButton onClick={props.onSearchClick} />
        <InfoButton pressed={props.infoPressed} onClick={props.onInfoClick} />
      </div>
      <h1 className="route-name">{props.route_name}</h1>
    </header>
  );
};

export default RouteToolbar;
