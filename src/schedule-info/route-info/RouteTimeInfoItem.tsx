import { FunctionalComponent, h } from 'preact';
import { Time, TimeData } from '../../common/Time';
import { InfoItem } from '../InfoItem';

interface Props {
    readonly startTime: TimeData;
    readonly endTime: TimeData;
}

const icon = [
    <path
        key="1"
        d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10c5.5,0,10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8c4.4,	0,8,3.6,8,8S16.4,20,12,20z"
    />,
    <polygon key="2" points="12.5,7 11,7 11,13 16.2,16.2 17,14.9 12.5,12.2 " />,
];

/**
 * Info item that displays when the first bus departs and the last bus arrives for a route.
 */
export const RouteTimeInfoItem: FunctionalComponent<Props> = props => (
    <InfoItem id="time" spanId="time-value" title="Bus route time" icon={icon}>
        <Time time={props.startTime} /> - <Time time={props.endTime} />
    </InfoItem>
);
