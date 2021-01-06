import pathPrefix from 'consts:pathPrefix';
import Fuse from 'fuse.js';
import { Route, Stop } from '../../shared/gtfs-types';
import { registerPromiseWorker } from '../register';
import { fuseRoutes, fuseStops } from './gtfs-search';
import { AutocompletionRequest } from './places-autocomplete';
import { search } from './search';

interface DataMessage {
  type: 'data';
  routes: readonly Route[];
  stops: readonly Stop[];
}

interface SearchMessage {
  type: 'search';
  request: AutocompletionRequest;
}

export type Message = DataMessage | SearchMessage;

function loadIndex() {
  return fetch(pathPrefix + 'indexes.json').then((res) => {
    if (!res.ok) return undefined;

    return res.json().then((indexData: Record<'routes' | 'stops', unknown>) => {
      const { routes, stops } = indexData;
      return {
        routes: Fuse.parseIndex<Route>(routes),
        stops: Fuse.parseIndex<Stop>(stops),
      };
    });
  });
}

registerPromiseWorker((message: Message) => {
  switch (message.type) {
    case 'data':
      return loadIndex().then((indexes) => {
        fuseRoutes.initialize(message.routes, indexes?.routes);
        fuseStops.initialize(message.stops, indexes?.stops);
      });
    case 'search':
      return search(message.request);
    default:
      throw new Error(`Invalid message type ${JSON.stringify(message)}`);
  }
});
