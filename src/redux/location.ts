import { Action } from 'redux';

const UPDATE_LOCATION = 'UPDATE_LOCATION';
const LOCATION_ERROR = 'LOCATION_ERROR';

/** @see https://developer.mozilla.org/en-US/docs/Web/API/PositionError */
enum PositionErrorCode {
	PERMISSION_DENIED = 1,
	POSITION_UNAVAILABLE = 2,
	TIMEOUT = 3,
}

export interface LocationState {
	pos: { lat: number, lng: number } | null,
	error: PositionErrorCode | null,
}

export default function locationReducer(
	state: LocationState = { pos: null, error: null },
	action: Action & { payload: any }
): LocationState {
	switch (action.type) {
		case UPDATE_LOCATION: {
			const payload = <Position> action.payload;
			return {
				pos: {
					lat: payload.coords.latitude,
					lng: payload.coords.longitude,
				},
				error: null,
			};
		}

		case LOCATION_ERROR: {
			const payload = <PositionError> action.payload;
			return {
				pos: null,
				error: payload.code
			};
		}

		default:
			return state;
	}
}


export function updateLocation(position: Position) {
	return { type: UPDATE_LOCATION, payload: position };
}

export function handleLocationError(err: PositionError) {
	return { type: LOCATION_ERROR, payload: err, error: true };
}
