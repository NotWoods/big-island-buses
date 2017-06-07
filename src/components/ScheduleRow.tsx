import * as React from 'react';
import * as moment from 'moment';
import { getStopURL } from '../utils';
import ConnectionLink from './BasicConnectionLink';

export interface ScheduleRowProps {
  stop_id: string;
  stop_name: string;
  time: moment.Moment;
  connections: {
    route_id: string;
    route_color: string;
    route_text_color?: string;
    route_name: string;
  }[];
}

/**
 * A row in the schedule, displaying a stop time. Includes a link to the
 * corresponding stop and a time element with a datetime attribute.
 * Also shows a list of small ConnectionLink components
 */
const ScheduleRow: React.SFC<ScheduleRowProps> = props => (
  <li className="schedule-row">
    <i className="schedule-icon" />
    <a className="schedule-stop" href={getStopURL(props.stop_id)}>
      {props.stop_name}
    </a>
    <time className="schedule-time" dateTime={props.time.format('H:mm:ss')}>
      {props.time.format('h:mm a')}
    </time>
    <ul className="schedule-connections">
      {props.connections.map(connection => (
        <li className="connection">
          <ConnectionLink
            key={connection.route_id}
            route_id={connection.route_id}
            route_color={connection.route_color}
            route_text_color={connection.route_text_color}
            route_name={connection.route_name}
          />
        </li>
      ))}
    </ul>
  </li>
);

export default ScheduleRow;
