import { h } from 'preact';
import { InfoItem } from './InfoItem';
import { Stop } from '../../server-render/api-types';
import { StopLink } from '../links';

interface RouteLocationProps {
    firstStop?: Pick<Stop, 'stop_id' | 'name'>;
    lastStop?: Pick<Stop, 'stop_id' | 'name'>;
}

export const RouteLocation = (props: RouteLocationProps) => {
    return (
        <InfoItem
            id="place"
            title="Bus route location"
            spanId="place-value"
            icon={
                <path d="M20.5,3c-0.1,0-0.1,0-0.2,0L15,5.1L9,3L3.4,4.9C3.2,5,3,5.1,3,5.4v15.1C3,20.8,3.2,21,3.5,21c0.1,0,0.1,0,0.2,	0L9,18.9l6,2.1l5.6-1.9c0.2-0.1,0.4-0.3,0.4-0.5V3.5C21,3.2,20.8,3,20.5,3z M15,19l-6-2.1V5l6,2.1V19z" />
            }
        >
            Between <StopLink stop={props.firstStop} />
            {' - '}
            <StopLink stop={props.lastStop} />
        </InfoItem>
    );
};
