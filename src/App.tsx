import * as React from 'react';
import { Provider } from 'react-redux';
import Route from './components/route/Route';
import store from './redux/store';

import './css/core.css';

/* tslint:disable no-console */

class App extends React.Component<{}, null> {
  render() {
    return (
      <Provider store={store}>
        <Route />
      </Provider>
    );
  }
}

export default App;
