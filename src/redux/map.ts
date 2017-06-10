import { createAction, handleAction, Action } from 'redux-actions';

export interface MapState {
  working: boolean;
}

export const setMapWorking = createAction<boolean>('SET_MAP_WORKING');

export default handleAction(
  setMapWorking, {
    next(state: MapState, action: Action<boolean>) {
      return { working: action.payload };
    },
  },
  { working: false },
);
