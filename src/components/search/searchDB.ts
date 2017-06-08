import { Route, Stop } from 'query-pouch-gtfs/es/interfaces';

type SearcherCB<T> = (result: T) => void;

export class DBSearcher {
  routes: Map<string, Route>;
  stops: Map<string, Stop>;

  constructor(routeDB?: PouchDB.Database<Route>, stopDB?: PouchDB.Database<Stop>) {
    this.routes = new Map();
    this.stops = new Map();

    if (routeDB) { this.loadRoutes(routeDB); }
    if (stopDB) { this.loadStops(stopDB); }
  }

  async loadRoutes(db: PouchDB.Database<Route>) {
    const docs = await db.allDocs({ include_docs: true });
    for (const { doc } of docs.rows) {
      if (!doc) { continue; }

      if (doc.route_long_name) {
        this.routes.set(doc.route_long_name, doc);
      }
      if (doc.route_short_name) {
        this.routes.set(doc.route_short_name, doc);
      }
    }
  }

  async loadStops(db: PouchDB.Database<Stop>) {
    const docs = await db.allDocs({ include_docs: true });
    for (const { doc } of docs.rows) {
      if (!doc) { continue; }
      this.stops.set(doc.stop_name, doc);
    }
  }

  searchRoutes(input: string, callback?: SearcherCB<Route>): Route[] {
    let results: Route[] = [];
    this.routes.forEach((route, name) => {
      if (name.includes(input)) {
        results.push(route);
        if (callback) { callback(route); }
      }
    });
    return results;
  }

  searchStops(input: string, callback?: SearcherCB<Stop>): Stop[] {
    let results: Stop[] = [];
    this.stops.forEach((stop, name) => {
      if (name.includes(input)) {
        results.push(stop);
        if (callback) { callback(stop); }
      }
    });
    return results;
  }

  search(input: string, callback?: SearcherCB<Route|Stop>): (Route | Stop)[] {
    let i = 0;
    let results: (Route | Stop)[] = [];

    this.searchRoutes(input, route => {
      if (i < 2) { results.push(route); }
      i++;
    });

    i = 0;

    this.searchStops(input, stop => {
      if (i < 2) { results.push(stop); }
      i++;
    });

    return results;
  }

  destroy() {
    this.routes.clear();
    this.stops.clear();
  }
}
