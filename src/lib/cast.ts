import { CastingContext } from 'csv-parse';
import { toInt } from '../shared/utils/num.js';

export function cast(value: string, context: CastingContext) {
  switch (context.column) {
    case 'stop_lat':
    case 'stop_lon':
      return parseFloat(value);
    case 'route_sort_order':
    case 'stop_sequence':
    case 'transfer_duration':
    case 'min_transfer_time':
    case 'location_type':
    case 'wheelchair_boarding':
    case 'route_type':
    case 'continuous_pickup':
    case 'continuous_drop_off':
    case 'direction_id':
    case 'wheelchair_accessible':
    case 'bikes_allowed':
    case 'pickup_type':
    case 'drop_off_type':
    case 'exception_type':
    case 'payment_method':
    case 'transfers':
    case 'transfer_type':
      return toInt(value);
    case 'timepoint':
    case 'monday':
    case 'tuesday':
    case 'wednesday':
    case 'thursday':
    case 'friday':
    case 'saturday':
    case 'sunday':
      return toBool(value);
    case 'start_date':
    case 'end_date':
    case 'date':
    case 'feed_start_date':
    case 'feed_end_date':
      return parseGtfsDate(value);
    default:
      return value;
  }
}

/**
 * Switch from GTFS date to timestamp.
 */
function parseGtfsDate(date: string) {
  const year = date.slice(0, -4);
  const month = date.slice(-4, -2);
  const day = date.slice(-2);
  return `${year}-${month}-${day}`;
}

/**
 * Turns a number into a boolean.
 * @param i 0 returns false, 1 returns true
 */
function toBool(i: number | string): boolean {
  return toInt(i) !== 0;
}
