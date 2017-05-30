import * as React from 'react';

import RouteHeader from './RouteHeader';
import RouteTabs from './RouteTabs';
import ScheduleList from './ScheduleList';

const BaseRoute: React.SFC<{}> = props => {

  return (
    <article className="route">
      <header className="route-header">
        <RouteHeader />
        <RouteTabs />
      </header>
      <ScheduleList />
    </article>
  );
};

export default BaseRoute;
