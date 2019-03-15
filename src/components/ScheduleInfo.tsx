import { h, ComponentChildren } from 'preact';

const ScheduleInfoItem = (props: {
    id?: string;
    title: string;
    children: ComponentChildren;
    spanId?: string;
    value: ComponentChildren;
}) => (
    <div
        class="schedule-info__item"
        id={props.id}
        title={props.title}
        aria-label={props.title}
    >
        {props.children}
        <span class="schedule-info__item-value" id={props.spanId}>
            {props.value}
        </span>
    </div>
);

interface ScheduleInfoProps {
    name: string;
    color: string;
    textColor: string;
    trips: { value: string; children: string }[];
    firstStop: string;
    lastStop: string;
    startTime: string;
    endTime: string;
    nextStop: string;
    nextStopTime: string;
    weekdays: string;
}

export const ScheduleInfo = (props: ScheduleInfoProps) => (
    <section id="information">
        <ScheduleInfoItem
            id="trip-select-container"
            title="Select different trip"
            value={
                <select class="schedule-info__select" id="trip-select">
                    {props.trips.map(t => (
                        <option key={t.value} {...t} />
                    ))}
                </select>
            }
        >
            <label for="trip-select">
                <svg viewBox="0 0 24 24" alt="Select different trip">
                    <path d="M10,18h4v-2h-4V18z M3,6v2h18V6H3z M6,13h12v-2H6V13z" />
                </svg>
            </label>
        </ScheduleInfoItem>

        <ScheduleInfoItem
            id="place"
            title="Bus route location"
            spanId="place-value"
            value={`Between ${props.firstStop} - ${props.lastStop}`}
        >
            <svg viewBox="0 0 24 24" alt="Bus route location">
                <path d="M20.5,3c-0.1,0-0.1,0-0.2,0L15,5.1L9,3L3.4,4.9C3.2,5,3,5.1,3,5.4v15.1C3,20.8,3.2,21,3.5,21c0.1,0,0.1,0,0.2,	0L9,18.9l6,2.1l5.6-1.9c0.2-0.1,0.4-0.3,0.4-0.5V3.5C21,3.2,20.8,3,20.5,3z M15,19l-6-2.1V5l6,2.1V19z" />
            </svg>
        </ScheduleInfoItem>

        <ScheduleInfoItem
            id="time"
            spanId="time-value"
            title="Bus route time"
            value={`${props.startTime} - ${props.endTime}`}
        >
            <svg viewBox="0 0 24 24" alt="Bus route time">
                <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10c5.5,0,10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8c4.4,	0,8,3.6,8,8S16.4,20,12,20z" />
                <polygon points="12.5,7 11,7 11,13 16.2,16.2 17,14.9 12.5,12.2 " />
            </svg>
        </ScheduleInfoItem>

        <ScheduleInfoItem
            id="next-stop"
            spanId="next-stop-value"
            title="Next bus stop"
            value={`Reaches ${props.nextStop} in ${props.nextStopTime}`}
        >
            <svg viewBox="0 0 24 24" alt="Next bus stop">
                <path d="M4,16c0,0.9,0.4,1.7,1,2.2V20c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1h8v1c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-1.8c0.6-0.5,1-1.3,1-2.2V6c0-3.5-3.6-4-8-4C7.6,2,4,2.5,4,6V16z M7.5,17C6.7,17,6,16.3,6,15.5S6.7,14,7.5,14C8.3,14,9,14.7,9,15.5S8.3,17,7.5,17z M16.5,17c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5S17.3,17,16.5,17z M18,11H6V6h12V11z" />
            </svg>
        </ScheduleInfoItem>

        <ScheduleInfoItem
            id="week-days"
            spanId="week-days-value"
            title="Next bus stop"
            value={props.weekdays}
        >
            <svg viewBox="0 0 24 24" alt="Next bus stop">
                <path d="M19,3h-1V1h-2v2H8V1H6v2H5C3.9,3,3,3.9,3,5l0,14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V8h14V19z" />
                <rect x="7" y="10" width="5" height="5" />
            </svg>
        </ScheduleInfoItem>
    </section>
);
