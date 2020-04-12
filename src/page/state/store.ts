import createStore, { Store } from 'unistore';

export const enum View {
  LIST,

  MAP_PRIMARY,
  STREET_PRIMARY,
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
  locatePermission: boolean;
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
  locatePermission: false,
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
) {
  return function connected<Result>(fn: (props: Props) => Result) {
    let lastProps: Props | undefined;
    store.subscribe(state => {
      Promise.resolve(mapStateToProps(state)).then(props => {
        if (!lastProps || differentObjects(props, lastProps)) {
          lastProps = props;
          fn(props);
        }
      });
    });
  };
}
