import * as React from 'react';
import * as GTFS from 'query-pouch-gtfs/es/interfaces';

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
  ...list: string[]
): (component: React.ComponentClass<T & DatabasesProps>) => React.ComponentClass<T> {
  // TODO: a HOC that applies the above database props to a component
  return component => {
    const databases = {} as Partial<DatabasesProps>;

    class WrappedComponent extends React.Component<T, void> {
      render() {
        return React.createElement(
          component,
          Object.assign({}, this.props, databases as DatabasesProps)
        );
      }
    }

    return WrappedComponent;
  };
}
