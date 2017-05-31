import { createAction, handleAction, Action } from 'redux-actions';

/** @see https://developer.mozilla.org/en-US/docs/Web/API/PositionError */
enum PositionErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
}

export interface LocationState {
  pos: { lat: number, lng: number } | null;
  error: PositionErrorCode | null;
}

export const updateLocation = createAction('UPDATE_LOCATION');

export default handleAction(
  updateLocation, {
    next(state: LocationState, action: Action<Position>) {
      const { coords } = <Position> action.payload;
      return {
        pos: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
        error: null,
      };
    },
    throw(state: LocationState, action: Action<PositionError>) {
      const err = <PositionError> action.payload;
      return {
        pos: null,
        error: <PositionErrorCode> err.code,
      };
    }
  },
  { pos: null, error: null },
);
