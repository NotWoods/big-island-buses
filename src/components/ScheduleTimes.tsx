import { h } from 'preact';

interface ScheduleTimeProps {
    href: string;
    color: string;
    name: string;
    time: string;
}

export const ScheduleTime = (props: ScheduleTimeProps) => (
    <a href={props.href}>
        <div class="lines">
            <span class="line" style={`background-color:${props.color}`} />
            <span class="line" style={`background-color:${props.color}`} />
        </div>
        <span class="name">{props.name}</span>
        <time>{props.time}</time>
    </a>
);
