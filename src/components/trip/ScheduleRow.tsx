import * as React from 'react';
import * as moment from 'moment';
import { getStopURL } from '../../utils';

import '../../css/vars.css';
import '../../css/trip/ScheduleRow.css';

export interface ScheduleRowProps {
  stop_id: string;
  stop_name: string;
  time: moment.Moment;
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
  </li>
);

export default ScheduleRow;
