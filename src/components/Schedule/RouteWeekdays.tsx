import { h } from 'preact';
import { Weekdays } from '../../server-render/api-types';
import { WEEKDAY_NAMES } from '../../server-render/parse-date';
import { InfoItem } from './InfoItem';

const icon = [
    <path
        key="1"
        d="M19,3h-1V1h-2v2H8V1H6v2H5C3.9,3,3,3.9,3,5l0,14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V8h14V19z"
    />,
    <rect key="2" x="7" y="10" width="5" height="5" />,
];

function weekdaysToString(days: Weekdays) {
    if (days.every(Boolean)) return 'Daily';
    if (days[0] && days[6] && days.slice(1, 6).every(b => !b)) {
        return 'Saturday - Sunday';
    }
    const firstDay = days.indexOf(true);
    const lastDay = days.lastIndexOf(true);
    if (firstDay === lastDay) return WEEKDAY_NAMES[firstDay];
    else if (days.slice(firstDay, lastDay + 1).every(Boolean)) {
        return `${WEEKDAY_NAMES[firstDay]} - ${WEEKDAY_NAMES[lastDay]}`;
    } else {
        return WEEKDAY_NAMES.filter((_, i) => days[i]).join(', ');
    }
}

export const RouteWeekdays = (props: { days: Weekdays }) => (
    <InfoItem
        id="week-days"
        spanId="week-days-value"
        title="Bus route weekdays"
        icon={icon}
    >
        {weekdaysToString(props.days)}
    </InfoItem>
);
