import { Route, Stop } from 'query-pouch-gtfs';

// If true is returned, stop searching.
type SearcherCB<T> = (result: T) => void | boolean;

interface SearchResult {
  matched: string;
  text: string;
  iconClass: string;
  iconStyle?: React.CSSProperties;
  type: 'route' | 'stop';
  id: string;
}

interface SearchCache {
  matched: string;
  results: SearchResult[];
}

export class DBSearcher {
  limit: number = 10;

  private routeDB: PouchDB.Database<Route>;
  private stopDB: PouchDB.Database<Stop>;

  private routeCache?: SearchCache;
  private stopCache?: SearchCache;

  constructor(routeDB: PouchDB.Database<Route>, stopDB: PouchDB.Database<Stop>) {
    Object.assign(this, { routeDB, stopDB });
  }

  protected async searchDB<T>(
    db: PouchDB.Database<T>,
    callback: SearcherCB<T>,
    cache?: SearchCache,
  ) {
    const options = {
      include_docs: true,
      limit: this.limit,
    } as PouchDB.Core.AllDocsWithinRangeOptions;

    // Paginate through the database until either
    // all docs are checked, or true is returned by the callback.
    while (true) {
      const response = await db.allDocs(options);
      // Stop if no items are present
      if (response.rows.length === 0) { return; }

      // Check every document unless shouldStop is true
      for (const row of response.rows) {
        const shouldStop = callback(row.doc as T);
        if (shouldStop) { return; }
      }

      // Update the starting point for the next page
      options.startkey = response.rows[response.rows.length - 1].id;
      options.skip = 1;
    }
  }

  async searchRoutes(input: string, maxResults: number): Promise<SearchResult[]> {
    const routeResults: SearchResult[] = [];

    // Look in the cache first
    if (this.routeCache && input.includes(this.routeCache.matched)) {
      for (const result of this.routeCache.results) {
        if (routeResults.length >= maxResults) { break; }
        if (result.text.includes(input)) { routeResults.push(result); }
      }
    }

    // If the cache didn't yeild enough results, check the database
    if (routeResults.length < maxResults) {
      await this.searchDB(this.routeDB, route => {
        // Check if either name matches the input
        let text: string = '';
        if (route.route_short_name.includes(input)) {
          text = route.route_short_name;
        } else if (route.route_long_name.includes(input)) {
          text = route.route_long_name;
        }

        // If there is a match, save the result
        if (text) {
          routeResults.push({
            iconClass: 'route-result-icon',
            iconStyle: { color: `#${route.route_color || '000'}` },
            type: 'route',
            id: route.route_id,
            text,
            matched: input,
          });
        }

        // Return true if enough results are found
        return routeResults.length >= maxResults;
      });

      // Save the new cache using the found results
      this.routeCache = {
        matched: input,
        results: routeResults,
      };
    }

    return routeResults;
  }

  async searchStops(input: string, maxResults: number): Promise<SearchResult[]> {
    const stopResults: SearchResult[] = [];

    // Look in the cache first
    if (this.stopCache && input.includes(this.stopCache.matched)) {
      for (const result of this.stopCache.results) {
        if (stopResults.length >= maxResults) { break; }
        if (result.text.includes(input)) { stopResults.push(result); }
      }
    }

    // If the cache didn't yeild enough results, check the database
    if (stopResults.length < maxResults) {
      await this.searchDB(this.stopDB, stop => {
        // If there is a match, save the result
        if (stop.stop_name.includes(input)) {
          stopResults.push({
            text: stop.stop_name,
            matched: input,
            iconClass: 'stop-result-icon',
            type: 'stop',
            id: stop.stop_id,
          });
        }

        // Return true if enough results are found
        return stopResults.length >= maxResults;
      });

      this.routeCache = {
        matched: input,
        results: stopResults,
      };
    }

    return stopResults;
  }

  async search(input: string): Promise<SearchResult[]> {
    const [routeResults, stopResults] = await Promise.all([
      this.searchRoutes(input, 2),
      this.searchStops(input, 2),
    ]);

    return [...routeResults, ...stopResults];
  }
}
