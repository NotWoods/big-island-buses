// import * as React from 'react';
import * as GTFS from 'gtfs-to-pouch/es/interfaces';
import { Databases } from 'gtfs-to-pouch/es/dbs';

export interface DatabasesProps {
  agencyDB: PouchDB.Database<GTFS.Agency>;
  calendarDB: PouchDB.Database<GTFS.Calendar>;
  calendarDateDB: PouchDB.Database<GTFS.CalendarDate>;
  fareAttributeDB: PouchDB.Database<GTFS.FareAttribute>;
  fareRulesDB: PouchDB.Database<GTFS.FareRule>;
  feedInfoDB: PouchDB.Database<GTFS.FeedInfo>;
  frequencyDB: PouchDB.Database<GTFS.Frequency>;
  routeDB: PouchDB.Database<GTFS.Route>;
  shapeDB: PouchDB.Database<GTFS.Shape>;
  stopDB: PouchDB.Database<GTFS.Stop>;
  stopTimeDB: PouchDB.Database<GTFS.StopTime>;
  transferDB: PouchDB.Database<GTFS.Transfer>;
  tripDB: PouchDB.Database<GTFS.Trip>;
}

export function useDatabase<T>(
  ...list: (keyof Databases)[]
): (component: React.ComponentClass<T & DatabasesProps>) => React.ComponentClass<T> {
  // TODO: a HOC that applies the above database props to a component
  return component => component;
}
