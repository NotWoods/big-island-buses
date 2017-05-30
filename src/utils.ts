import * as moment from 'moment';

export const URL_PREFIX = '';

export function getURL(route_id: string, trip_id?: string) {
  return URL_PREFIX + `/${route_id}/${trip_id || ''}`;
}

export function getStopURL(stop_id: string) {
  return `?stop_id=${stop_id}`;
}

/**
 * Sets the date of a moment to zero, leaving only the hour and
 * smaller units
 */
export function timeOnly(base: moment.Moment): moment.Moment {
  return moment().set({
    hour: base.hour(),
    minute: base.minute(),
    second: base.second(),
    millisecond: base.millisecond(),
  });
}
