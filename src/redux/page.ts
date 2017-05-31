import { createAction, Action } from 'redux-actions';

export interface PageState {
  route_id: string;
  trip_id?: string;
  stop_id?: string;
}

type ConnectionPayload = { route_id: string, stop_id?: string };

export const setRoute = createAction('SET_ROUTE');
export const setTrip = createAction('SET_TRIP');
export const setStop = createAction('SET_STOP');
export const openConnection = createAction(
  'OPEN_CONNECTION',
  (route_id: string, stop_id: string) => ({ route_id, stop_id })
);

export default function pageReducer(
  state: PageState = { route_id: '' },
  action: Action<string | ConnectionPayload>,
) {
  switch (action.type) {
    case 'SET_ROUTE':
      return {
        route_id: action.payload || '',
        trip_id: undefined,
        stop_id: state.stop_id,
      };

    case 'SET_TRIP':
      return { ...state, trip_id: action.payload || undefined };

    case 'SET_STOP':
      return { ...state, stop_id: action.payload || undefined };

    case 'OPEN_CONNECTION': {
      const { route_id, stop_id } = <ConnectionPayload> action.payload;
      return {
        route_id,
        trip_id: undefined,
        stop_id: stop_id || undefined,
      };
    }

    default:
      return state;
  }
}
