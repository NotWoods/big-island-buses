import { h } from 'preact';
import { TimeData, Time } from './Time';

interface ScheduleTimeProps {
    key?: string;
    href: string;
    color: string;
    name: string;
    time: TimeData;
}

export const ScheduleTime = (props: ScheduleTimeProps) => (
    <a class="schedule-time" href={props.href}>
        <div class="scedule-time__lines lines">
            <span class="line" style={`background-color:${props.color}`} />
            <span class="line" style={`background-color:${props.color}`} />
        </div>
        <span class="schedule-time__name name">{props.name}</span>
        <Time time={props.time} />
    </a>
);

export const ScheduleTimes = (props: { schedule: ScheduleTimeProps[] }) => (
    <section class="schedule-time__container">
        {props.schedule.map(s => (
            <ScheduleTime key={s.href} {...s} />
        ))}
    </section>
);
