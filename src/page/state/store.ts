import createStore, { Store } from 'unistore';

type PromiseValue<T> = T extends Promise<infer R> ? R : T;

type PromiseValues<T> = {
  readonly [P in keyof T]: PromiseValue<T[P]>;
};

export const enum View {
  LIST,

  MAP_PRIMARY,
  STREET_PRIMARY,
}

export const enum LocationPermission {
  NOT_ASKED = -1,
  GRANTED = 0,
  DENIED = 1,
  UNAVALIABLE = 2,
  TIMEOUT = 3,
}

export type LatLngLiteral = google.maps.ReadonlyLatLngLiteral;

export interface State {
  readonly route: {
    readonly id?: string | null;
    readonly trip?: string | null;
  };
  readonly stop?: string | null;
  readonly view: {
    readonly route: View;
    readonly stop: View;
  };
  readonly locatePermission: LocationPermission;
  readonly userLocation?: LatLngLiteral;
  readonly searchLocation?: LatLngLiteral;
  readonly focus: 'user' | 'search' | 'stop';
}

export const store = createStore<State>({
  route: {},
  view: {
    route: View.LIST,
    stop: View.MAP_PRIMARY,
  },
  locatePermission: LocationPermission.NOT_ASKED,
  focus: 'stop',
});

export function memoize<Func extends (...args: any[]) => any>(fn: Func): Func {
  let lastArgs: Parameters<Func> | undefined;
  let lastResult: ReturnType<Func> | undefined;
  return function (...args: Parameters<Func>) {
    if (lastArgs?.every((arg, i) => arg === args[i])) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  } as Func;
}

function differentObjects<T>(a: T, b: T) {
  return (Object.keys(a) as Array<keyof T>).some((key) => a[key] === b[key]);
}

/**
 * Like Promise.all, but for objects with promises in the values.
 */
function awaitObject<T>(obj: T) {
  const keys = Object.keys(obj) as Array<keyof T>;
  return Promise.all(keys.map((key) => obj[key])).then((values) => {
    const result: Partial<T> = {};
    keys.forEach((key, i) => {
      result[key] = values[i];
    });
    return result as PromiseValues<T>;
  });
}

export function connect<Props>(
  store: Store<State>,
  mapStateToProps: (state: State) => Props,
  callback: (props: PromiseValues<Props>) => void,
) {
  let lastProps: PromiseValues<Props> | undefined;

  function listener(state: State) {
    return awaitObject(mapStateToProps(state)).then((props) => {
      if (!lastProps || differentObjects(props, lastProps)) {
        lastProps = props;
        callback(props);
      }
    });
  }

  listener(store.getState());
  return store.subscribe(listener);
}
