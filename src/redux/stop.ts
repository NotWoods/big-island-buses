import { Action } from 'redux';
import {
	Stop
} from 'gtfs-to-pouch/es/interfaces';

const OPEN_STOP = 'OPEN_STOP';
const STOP_LOADED = 'STOP_LOADED';
const SET_ADDRESS = 'SET_ADDRESS';

interface NoStopOpenState {
	stop_id: '',
}

interface StopLoadingState {
	stop_id: string
}

interface StopOpenState {
	stop_id: string,
	address?: string,

	stop_name: string,
	stop_desc?: string,
	stop_url?: string
}

export type StopState = NoStopOpenState | StopLoadingState | StopOpenState

export default function locationReducer(
	state: StopState = { stop_id: '' },
	action: Action & { payload: any }
): StopState {
	switch (action.type) {
		case OPEN_STOP:
			return {
				stop_id: <string> action.payload
			};

		case STOP_LOADED: {
			const stop = <Stop> action.payload;
			return {
				...state,
				...stop,
			}
		}

		case SET_ADDRESS:
			return {
				...state,
				address: <string> action.payload,
			}

		default:
			return state;
	}
}


export function openStop(stop_id: string) {
	return { type: OPEN_STOP, payload: stop_id };
}

export function closeStop() {
	return { type: OPEN_STOP, payload: '' };
}

export function loadedStop(stop: Stop) {
	return { type: STOP_LOADED, payload: stop };
}

export function setStopAddress(addr: string) {
	return { type: SET_ADDRESS, payload: addr };
}
