import { toInt } from '../shared/utils/num.js';

export { gtfsArrivalToString } from '../shared/utils/date.js';

export function parseGtfsDate(date: string) {
  const year = date.slice(0, -4);
  const month = date.slice(-4, -2);
  const day = date.slice(-2);
  return new Date(toInt(year), toInt(month), toInt(day));
}
