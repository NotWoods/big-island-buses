import { writable, derived, Readable } from 'svelte/store';

type PromiseValue<T> = T extends Promise<infer R> ? R : T;

type PromiseValues<T> = {
  readonly [P in keyof T]: PromiseValue<T[P]>;
};

export enum View {
  LIST,

  MAP_PRIMARY,
  STREET_PRIMARY,
}

export enum LocationPermission {
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
  readonly locatePermission: LocationPermission;
  readonly userLocation?: LatLngLiteral;
  readonly searchLocation?: {
    placeId: string;
    location: LatLngLiteral;
  };
  readonly focus: 'user' | 'search' | 'stop';
}

export const stopViewStore = writable<View>(View.MAP_PRIMARY);

export const store = writable<State>({
  route: {},
  locatePermission: LocationPermission.NOT_ASKED,
  focus: 'stop',
});

export function strictEqual<T>(a: T, b: T) {
  return a === b;
}

export function deepEqual<T>(a: T, b: T) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return (aKeys as Array<keyof T>).every((key) => a[key] === b[key]);
}

/**
 * Like Promise.all, but for objects with promises in the values.
 */
export function awaitObject<T>(obj: T) {
  const keys = Object.keys(obj) as Array<keyof T>;
  return Promise.all(keys.map((key) => obj[key])).then((values) => {
    const result: Partial<T> = {};
    keys.forEach((key, i) => {
      result[key] = values[i];
    });
    return result as PromiseValues<T>;
  });
}

export function connect<Props, State>(
  store: Readable<State>,
  mapStateToProps: (state: State) => Promise<Props> | Props,
  propsEqual: (a: Props, b: Props) => boolean,
  callback: (props: Props) => void,
) {
  let lastProps: Props | undefined;

  function listener(state: State) {
    return Promise.resolve(mapStateToProps(state)).then((props) => {
      if (!lastProps || !propsEqual(lastProps, props)) {
        lastProps = props;
        callback(props);
      }
    });
  }

  return store.subscribe(listener);
}

/** One or more `Readable`s. */
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];
/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U>
  ? U
  : {
      [K in keyof T]: T[K] extends Readable<infer U> ? U : never;
    };

export function derivedAsync<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>) => Promise<T>,
  initialValue?: T,
) {
  return derived(
    stores,
    (values, set) => {
      fn(values).then(set);
    },
    initialValue,
  );
}
