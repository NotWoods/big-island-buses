import * as React from 'react';
import { Provider } from 'react-redux';
import Stop from './components/stop/Stop';
import store from './redux/store';

import './css/core.css';

/* tslint:disable no-console */

class App extends React.Component<{}, null> {
  render() {
    return (
      <Provider store={store}>
        <Stop stop_id="bd" />
      </Provider>
    );
  }
}

export default App;
