import { FunctionalComponent, h } from 'preact';
import { Stop } from '../../common/api-types';
import { StopLink } from '../../navigation/links';
import { Time, TimeData } from '../../common/Time';
import { InfoItem } from '../InfoItem';

interface Props {
    readonly nextStop?: Pick<Stop, 'stop_id' | 'name'>;
    readonly timeToArrival?: TimeData;
}

/**
 * Info item that displays the next stop that the bus will be arriving at.
 */
export const NextStopInfoItem: FunctionalComponent<Props> = props => (
    <InfoItem
        id="next-stop"
        spanId="next-stop-value"
        title="Next bus stop"
        icon={
            <path d="M4,16c0,0.9,0.4,1.7,1,2.2V20c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1h8v1c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1.8c0.6-0.5,1-1.3,1-2.2V6c0-3.5-3.6-4-8-4C7.6,2,4,2.5,4,6V16z M7.5,17C6.7,17,6,16.3,6,15.5S6.7,14,7.5,14C8.3,14,9,14.7,9,15.5S8.3,17,7.5,17z M16.5,17c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5S17.3,17,16.5,17z M18,11H6V6h12V11z" />
        }
    >
        Reaches <StopLink stop={props.nextStop} />
        {' in '}
        {props.timeToArrival ? <Time time={props.timeToArrival} /> : null}
    </InfoItem>
);
