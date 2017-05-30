import * as React from 'react';

import * as moment from 'moment';
import RouteToolbar from './components/RouteToolbar';
import Tabs from './components/Tabs';

/* tslint:disable no-console */

class App extends React.Component<{}, null> {
  render() {
    return (
      <div>
        <RouteToolbar
          trip_start={moment('7:00:00', 'H:mm:ss')}
          route_name="Intra Kona"
          infoPressed={false}
          onSearchClick={() => console.log('Search clicked')}
          onInfoClick={() => console.log('Info clicked')}
        />
        <Tabs tabs={{ schedule: 'Schedule', map: 'Map' }} />
      </div>
    );
  }
}

export default App;
