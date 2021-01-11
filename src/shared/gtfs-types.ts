export interface GTFSData {
  routes: { [route_id: string]: Route };
  stops: { [stop_id: string]: Stop };
  calendar: { [service_id: string]: Calendar };
}

/* Server needs to iterate through all trips, client doesn't. */
export interface ServerGTFSData extends GTFSData {
  trips: { [trip_id: string]: Route['route_id'] };
  info: FeedInfo;
}

export interface CsvCalendar {
  service_id: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  start_date: string;
  end_date: string;
}

export interface Calendar
  extends Readonly<
    Pick<CsvCalendar, 'service_id' | 'start_date' | 'end_date'>
  > {
  readonly days: readonly [
    sunday: boolean,
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
  ];
  readonly text_name: string;
}

export interface CsvCalendarDates {
  service_id: string;
  date: string;
  exception_type: number;
}

export interface CsvRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string;
  route_type: number;
  route_color: string;
  route_text_color: string;
  agency_id: string;
  route_url: string;
  route_sort_order: number;
}

export interface Route extends Readonly<CsvRoute> {
  readonly trips: { [trip_id: string]: Trip };
}

export interface CsvTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  direction_id: number;
  trip_short_name: string;
  trip_headsign: string;
}

export interface Trip extends Readonly<CsvTrip> {
  /**
   * Stop times, sorted by `stop_sequence`.
   */
  readonly stop_times: StopTime[];
}

export interface CsvStop {
  stop_id: string;
  stop_name: string;
  stop_desc: string;
  stop_lat: number;
  stop_lon: number;
}

export interface Stop extends Readonly<Omit<CsvStop, 'stop_lat' | 'stop_lon'>> {
  readonly position: {
    readonly lat: number;
    readonly lng: number;
  };
  readonly trips: {
    readonly trip: Trip['trip_id'];
    readonly dir: number;
    readonly route: Route['route_id'];
    readonly sequence: number;
    readonly time: string;
  }[];
  readonly routes: Route['route_id'][];
}

export interface CsvStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
  pickup_type: number;
  drop_off_type: number;
  continuous_pickup: number;
  continuous_drop_off: number;
  timepoint: number;
}

export interface StopTime
  extends Readonly<
    Omit<CsvStopTime, 'continuous_drop_off' | 'drop_off_type'>
  > {}

export interface FeedInfo {
  feed_publisher_name: string;
  feed_publisher_url: string;
  feed_start_date: string;
  feed_version: string;
  feed_contact_email: string;
  feed_contact_url: string;
}
