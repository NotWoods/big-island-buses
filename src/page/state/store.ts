import createStore, { Store } from 'unistore';

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
  route: {
    id?: string | null;
    trip?: string | null;
  };
  stop?: string | null;
  view: {
    route: View;
    stop: View;
  };
  locatePermission: LocationPermission;
  userLocation?: LatLngLiteral;
  searchLocation?: LatLngLiteral;
  focus: 'user' | 'search' | 'stop';
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
  return function(...args: Parameters<Func>) {
    if (lastArgs?.every((arg, i) => arg === args[i])) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  } as Func;
}

function differentObjects<T>(a: T, b: T) {
  return (Object.keys(a) as Array<keyof T>).some(key => a[key] === b[key]);
}

export function connect<Props>(
  store: Store<State>,
  mapStateToProps: (state: State) => Promise<Props> | Props,
  callback: (props: Props) => void,
) {
  let lastProps: Props | undefined;
  return store.subscribe(state =>
    Promise.resolve(mapStateToProps(state)).then(props => {
      if (!lastProps || differentObjects(props, lastProps)) {
        lastProps = props;
        callback(props);
      }
    }),
  );
}
