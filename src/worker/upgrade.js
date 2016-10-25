/**
 * @const {number} database version, based on latest GTFS update date (YYYYMMDD)
 */
export const GTFS_VERSION = 20160203;

/**
 * A callback for IDBDatabase's onupgradedneeded event.
 * @param {Event} event
 */
export default function handleUpgradeNeeded(db) {
	/* eslint-disable no-unused-vars */

	if (db.oldVersion >= GTFS_VERSION) return;

	const agency = db.createObjectStore('agency', { keyPath: 'agency_id' });

	const stops = db.createObjectStore('stops', { keyPath: 'stop_id' });
	stops.createIndex('parent_station', 'parent_station');

	const routes = db.createObjectStore('routes', { keyPath: 'route_id' });

	const trips = db.createObjectStore('trips', { keyPath: 'trip_id' });
	trips.createIndex('route_id', 'route_id');

	const stop_times = db.createObjectStore('stop_times',
		{ keyPath: ['trip_id', 'stop_sequence'] });
	stop_times.createIndex('trip_id', 'trip_id');
	stop_times.createIndex('stop_id', 'stop_id');

	const calendar = db.createObjectStore('calendar', { keyPath: 'service_id' });
	calendar.createIndex('start_date', 'start_date');
	calendar.createIndex('end_date', 'end_date');

	const calendar_dates = db.createObjectStore('calendar_dates',
		{ keyPath: ['service_id', 'date'] });
	calendar_dates.createIndex('service_id', 'service_id');

	const fare_attributes = db.createObjectStore('fare_attributes',
		{ keyPath: 'fare_id' });

	const fare_rules = db.createObjectStore('fare_rules');

	const shapes = db.createObjectStore('shapes',
		{ keyPath: ['shape_id', 'shape_pt_sequence'] });
	shapes.createIndex('shape_id', 'shape_id');

	const frequencies = db.createObjectStore('frequencies',
		{ keyPath: ['trip_id', 'start_time', 'end_time'] });

	const transfers = db.createObjectStore('transfers',
		{ keyPath: ['from_stop_id', 'to_stop_id'] });

	const feed_info = db.createObjectStore('feed_info');
}
