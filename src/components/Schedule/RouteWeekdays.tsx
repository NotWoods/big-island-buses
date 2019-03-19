import { h } from 'preact';
import { InfoItem } from './InfoItem';

interface RouteWeekdaysProps {
    weekdays: string;
}

const icon = [
    <path
        key="1"
        d="M19,3h-1V1h-2v2H8V1H6v2H5C3.9,3,3,3.9,3,5l0,14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V8h14V19z"
    />,
    <rect key="2" x="7" y="10" width="5" height="5" />,
];

export const RouteWeekdays = (props: RouteWeekdaysProps) => (
    <InfoItem
        id="week-days"
        spanId="week-days-value"
        title="Bus route weekdays"
        icon={icon}
    >
        {props.weekdays}
    </InfoItem>
);
