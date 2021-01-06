import Fuse from 'fuse.js';
import { Route, Stop } from '../../shared/gtfs-types';
import { PredictionSubstring } from '../../shared/utils/search';
import { applyOffset, SearchRequest } from './helpers';

export class GtfsSearch<T> {
  private fuse: Fuse<T>;

  constructor(keys: Fuse.FuseOptionKey[]) {
    this.fuse = new Fuse<T>([], {
      includeMatches: true,
      keys,
    });
  }

  initialize(docs: readonly T[], index?: Fuse.FuseIndex<T>) {
    this.fuse.setCollection(docs, index);
  }

  search(request: SearchRequest) {
    const { input, offset } = request;
    return this.fuse.search(applyOffset(input, offset), {
      limit: 3,
    });
  }
}

export const fuseRoutes = new GtfsSearch<Route>(['route_long_name']);
export const fuseStops = new GtfsSearch<Stop>(['stop_name']);

export function normalizeMatches(
  matches: readonly Fuse.FuseResultMatch[] = [],
): PredictionSubstring[] {
  return matches.map((match) => {
    const [start, end] = match.indices[0];
    return {
      offset: start,
      length: end - start,
    };
  });
}
