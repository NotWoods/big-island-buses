import { Trip } from "../../gtfs-types";
import { toInt } from '../utils/num';

/**
 * Sorts stop time keys
 * @param {GTFSData stop_times} stopTimes
 * @return ordered list
 */
function sortedSequence(stopTimes: Trip['stop_times']): number[] {
  return Object.keys(stopTimes)
    .map(toInt)
    .sort((a, b) => a - b);
}

/**
 * Iterate through the stop times of a trip in sequence order.
 */
export function* sortedStopTimes(stopTimes: Trip['stop_times']) {
  const stopSequence = sortedSequence(stopTimes);
  for (const sequence of stopSequence) {
    yield stopTimes[sequence];
  }
}
