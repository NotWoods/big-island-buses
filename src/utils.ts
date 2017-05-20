export const URL_PREFIX = '';

export function getURL(route_id: string, trip_id?: string, stop_id?: string) {
	let url = URL_PREFIX + `/${route_id}/${trip_id || ''}`;
	if (stop) {
		url = `${url}?stop_id=${stop_id}`
	}

	return url;
}
