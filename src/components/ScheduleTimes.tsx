import { h } from 'preact';

interface ScheduleTimeProps {
    key?: string;
    href: string;
    color: string;
    name: string;
    time: Date;
}

const TIME_REGEX = /\d+-\d\d-\d\dT(\d\d:\d\d:\d\d).*/;

function timeIso(date: Date) {
    return date.toISOString().match(TIME_REGEX)![1];
}

export const ScheduleTime = (props: ScheduleTimeProps) => (
    <a class="schedule-time" href={props.href}>
        <div class="scedule-time__lines lines">
            <span class="line" style={`background-color:${props.color}`} />
            <span class="line" style={`background-color:${props.color}`} />
        </div>
        <span class="schedule-time__name name">{props.name}</span>
        <time dateTime={timeIso(props.time)}>
            {props.time.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
            })}
        </time>
    </a>
);

export const ScheduleTimes = (props: { schedule: ScheduleTimeProps[] }) => (
    <section class="schedule-time__container">
        {props.schedule.map(s => (
            <ScheduleTime key={s.href} {...s} />
        ))}
    </section>
);
