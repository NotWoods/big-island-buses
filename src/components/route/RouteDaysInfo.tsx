import * as React from 'react';
import { Weekdays, dateRangeString } from 'query-pouch-gtfs';

import '../../css/utils.css';

export interface RouteDaysInfoProps {
  routeDays: Set<Weekdays> | null;
}

/**
 * Displays the days that the route runs
 */
const RouteDaysInfo: React.SFC<RouteDaysInfoProps> = props => {
  let dateRange = '...';
  if (props.routeDays) {
    dateRange = 'Runs ' + dateRangeString(props.routeDays);
  }

  return (
    <p
      title="Route's days of service"
      className="info-text route-info-text route-days"
    >
      {dateRange}
    </p>
  );
};

export default RouteDaysInfo;
