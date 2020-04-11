import { toInt } from './num.js';

/**
 * Turns a date into a string with hours, minutes.
 * @param  {Date} 	date Date to convert
 * @param  {string} date 24hr string in format 12:00:00 to convert to string in 12hr format
 * @return {string}    	String representation of time
 */
export function stringTime(date: Date | string): string {
  if (typeof date === 'string') {
    if (date.indexOf(':') > -1 && date.lastIndexOf(':') > date.indexOf(':')) {
      const [hour, min, second] = date.split(':').map(toInt);
      date = new Date(0, 0, 0, hour, min, second, 0);
    }
  }
  if (typeof date != 'object') {
    throw new TypeError(`date must be Date or string, not ${typeof date}`);
  }

  let m = 'am';
  let displayHour = '';
  let displayMinute = '';
  const hr = date.getHours();
  const min = date.getMinutes();

  if (hr === 0) {
    displayHour = '12';
  } else if (hr === 12) {
    displayHour = '12';
    m = 'pm';
  } else if (hr > 12) {
    const mathHr = hr - 12;
    displayHour = mathHr.toString();
    m = 'pm';
  } else {
    displayHour = hr.toString();
  }

  if (min === 0) {
    displayMinute = '';
  } else if (min < 10) {
    displayMinute = ':0' + min.toString();
  } else {
    displayMinute = ':' + min.toString();
  }

  return displayHour + displayMinute + m;
}

/**
 * Returns a date object based on the string given
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {Date}
 */
export function gtfsArrivalToDate(string: string): Date {
  const [hour, min, second] = string.split(':').map(s => toInt(s));
  let extraDays = 0;
  let extraHours = 0;
  if (hour > 23) {
    extraDays = Math.floor(hour / 24);
    extraHours = hour % 24;
  }
  return new Date(0, 0, 0 + extraDays, hour + extraHours, min, second, 0);
}

/**
 * Combines stringTime() and gtfsArrivalToDate()
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {string}        String representation of time
 */
export function gtfsArrivalToString(string: string) {
  return stringTime(gtfsArrivalToDate(string));
}

/**
 * Returns the current time, with date stripped out
 * @return {Date} Current time in hour, min, seconds; other params set to 0
 */
export function nowDateTime(): Date {
  const now = new Date();
  return new Date(
    0,
    0,
    0,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    0,
  );
}
