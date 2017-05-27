import * as React from 'react';
import * as moment from 'moment';
import { timeOnly } from '../utils';

export interface NextStopInfoProps {
  nextStop: {
    stop_name: string,
    stop_id: string,
    arrival_time: moment.Moment,
  };
  now?: moment.Moment;
}

/**
 * Displays a link to the next stop reached by a bus route,
 * along with the time until that stop is reached
 */
const NextStopInfo: React.SFC<NextStopInfoProps> = props => {
  let nextStop: React.ReactNode = '';
  const { now = moment() } = props;

  if (props.nextStop) {
    const { stop_name, stop_id, arrival_time } = props.nextStop;
    const arrival = timeOnly(arrival_time);

    nextStop = (
      <a className="invisible" href={`?stop_id=${stop_id}`}>
        {`Reaches ${stop_name} ${arrival.to(now)}`}
      </a>
    );
  }

  return (
    <p
      title="Next bus stop reached"
      className="info-text route-info-text trip-next-stop"
    >
      {nextStop}
    </p>
  );
};

export default NextStopInfo;
