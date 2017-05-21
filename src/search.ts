import { Route, Stop } from 'gtfs-to-pouch/es/interfaces';

export class DBSearcher {
	routes: Map<string, Route>
	stops: Map<string, Stop>

	constructor(routeDB?: PouchDB.Database<Route>, stopDB?: PouchDB.Database<Stop>) {
		this.routes = new Map();
		this.stops = new Map();

		if (routeDB) this.loadRoutes(routeDB);
		if (stopDB) this.loadStops(stopDB);
	}

	async loadRoutes(db: PouchDB.Database<Route>) {
		const docs = await db.allDocs({ include_docs: true });
		for (const { doc } of docs.rows) {
			if (!doc) continue;

			if (doc.route_long_name)
				this.routes.set(doc.route_long_name, doc);
			if (doc.route_short_name)
				this.routes.set(doc.route_short_name, doc);
		}
	}

	async loadStops(db: PouchDB.Database<Stop>) {
		const docs = await db.allDocs({ include_docs: true });
		for (const { doc } of docs.rows) {
			if (!doc) continue;
			this.stops.set(doc.stop_name, doc);
		}
	}

	*searchRoutes(input: string): IterableIterator<Route> {
		for (const name of this.routes.keys()) {
			if (name.includes(input))
				yield this.routes.get(name) as Route;
		}
	}

	*searchStops(input: string): IterableIterator<Stop> {
		for (const name of this.stops.keys()) {
			if (name.includes(input))
				yield this.stops.get(name) as Stop;
		}
	}

	search(input: string): (Route | Stop)[] {
		const [route1, route2] = this.searchRoutes(input);
		const [stop1, stop2] = this.searchStops(input);
		return [route1, route2, stop1, stop2].filter(Boolean);
	}

	destroy() {
		this.routes.clear();
		this.stops.clear();
	}
}
