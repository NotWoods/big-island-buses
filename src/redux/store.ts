import { createStore, combineReducers } from 'redux';
import location from './location';
import page from './page';

export default createStore(
  combineReducers({
    location,
    page,
  })
);
