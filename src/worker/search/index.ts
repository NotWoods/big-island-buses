import pathPrefix from 'consts:pathPrefix';
import Fuse from 'fuse.js';
import { Route, Stop } from '../../gtfs-types';
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
  return fetch(pathPrefix + 'indexes.json')
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<Record<'routes' | 'stops', unknown>>;
      }
      return undefined;
    })
    .then((indexData) => {
      if (indexData) {
        const { routes, stops } = indexData;
        return {
          routes: Fuse.parseIndex<Route>(routes),
          stops: Fuse.parseIndex<Stop>(stops),
        };
      } else {
        return undefined;
      }
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
