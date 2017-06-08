import * as React from 'react';
import * as GTFS from 'query-pouch-gtfs/es/interfaces';

export interface DatabasesProps {
  agencyDB: PouchDB.Database<GTFS.Agency>;
  calendarDB: PouchDB.Database<GTFS.Calendar>;
  calendarDateDB: PouchDB.Database<GTFS.CalendarDate>;
  fareAttributeDB: PouchDB.Database<GTFS.FareAttribute>;
  fareRuleDB: PouchDB.Database<GTFS.FareRule>;
  feedInfoDB: PouchDB.Database<GTFS.FeedInfo>;
  frequencyDB: PouchDB.Database<GTFS.Frequency>;
  routeDB: PouchDB.Database<GTFS.Route>;
  shapeDB: PouchDB.Database<GTFS.Shape>;
  stopDB: PouchDB.Database<GTFS.Stop>;
  stopTimeDB: PouchDB.Database<GTFS.StopTime>;
  transferDB: PouchDB.Database<GTFS.Transfer>;
  tripDB: PouchDB.Database<GTFS.Trip>;
}

type GTFSName = 'agency' | 'calendar' | 'calendar_dates'
  | 'fare_attributes' | 'fare_rules' | 'feed_info' | 'frequencies'
  | 'routes' | 'shapes' | 'stops' | 'stop_times' | 'transfers' | 'trips';

function toDBName(name: GTFSName): string {
  if (name === 'frequencies') { return 'frequencyDB'; }

  let dbName: string = name;
  if (name.endsWith('s')) { dbName = name.slice(0, -1); }
  dbName = dbName.replace(/_([a-z])/, (match, letter) => letter.toUpperCase());
  return dbName + 'DB';
}

const cache: Partial<DatabasesProps> = {};

/**
 * A higher order component that applies database props to a component
 * @param list
 */
export function useDatabase<T>(
  ...list: GTFSName[]
): (component: React.ComponentClass<T & DatabasesProps>) => React.ComponentClass<T> {
  list.map(name => {
    const dbName = toDBName(name);
    if (!cache[dbName]) {
      const db = new PouchDB(name);
      PouchDB.replicate(`http://localhost:5984/${name}`, db);
    }
  });

  return component => {
    class WrappedComponent extends React.Component<T, void> {
      render() {
        return React.createElement(
          component,
          Object.assign({}, this.props, cache as DatabasesProps)
        );
      }
    }

    return WrappedComponent;
  };
}
