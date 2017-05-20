import { Action } from 'redux';
import {
	Trip, Weekdays, RouteType, HexCode, RouteDetails, Route,
	getRouteName,
} from 'gtfs-to-pouch/es/interfaces';

const CLOSE_ROUTE = 'CLOSE_ROUTE'
const OPEN_ROUTE = 'OPEN_ROUTE';
const LOAD_ROUTE_DETAILS = 'LOAD_ROUTE';
const OPEN_TRIP = 'OPEN_TRIP';

interface ClosedState {
	loaded: false
	open: false
}

interface UnloadedState {
	loaded: false
	open: true
	route_id: string
	trip_id: string

	route_name: string
	route_desc?: string
	route_type: RouteType
	route_url?: string
	route_color: HexCode
	route_text_color: HexCode
}

interface LoadedState {
	loaded: true
	open: true
	route_id: string
	trip_id: string

	dates: Set<Weekdays>
	trips: Map<string, Trip>

	route_name: string
	route_desc?: string
	route_type: RouteType
	route_url?: string
	route_color: HexCode
	route_text_color: HexCode
}

export type RouteState = ClosedState | UnloadedState | LoadedState

export default function locationReducer(
	state: RouteState = { loaded: false, open: false },
	action: Action & { payload: any }
): RouteState {
	switch (action.type) {
		case OPEN_TRIP:
			return {
				...state,
				trip_id: <string> action.payload
			};

		case OPEN_ROUTE: {
			const route = <Route> action.payload;
			return {
				loaded: false,
				open: true,
				...route,
				route_name: getRouteName(route),
				trip_id: state.open ? state.trip_id : '',
				route_color: route.route_color || '000000',
				route_text_color: route.route_text_color || 'ffffff',
			};
		}

		case CLOSE_ROUTE:
			return { loaded: false, open: false };

		case LOAD_ROUTE_DETAILS: {
			const details = <RouteDetails> action.payload;
			return {
				...state,
				loaded: true,
				open: true,
				dates: details.dates,
				trips: new Map<string, Trip>(details.trips.map(t => [t.trip_id, t])),
				...details.route_data,
				route_name: getRouteName(details.route_data),
				route_id: details.route_data.route_id,
				trip_id: state.open ? state.trip_id : '',
				route_color: details.route_data.route_color || '000000',
				route_text_color: details.route_data.route_text_color || 'ffffff',
			}
		}

		default:
			return state;
	}
}


export function closeRoute() {
	return { type: CLOSE_ROUTE };
}

export function openRoute(route: Route) {
	return { type: OPEN_ROUTE, payload: route };
}

export function loadRouteDetails(details: RouteDetails) {
	return { type: LOAD_ROUTE_DETAILS, payload: details };
}

export function openTrip(trip_id: string) {
	return { type: OPEN_TRIP, payload: trip_id };
}
