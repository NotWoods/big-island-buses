import { h, FunctionalComponent } from 'preact';
import { TimeData, Time, toTime } from '../Time';
import { StopTime, Stop } from '../../server-render/api-types';
import { fromIsoTime } from '../../server-render/parse-date';

interface ScheduleTimeProps {
    stop_id: string;
    color: string;
    name: string;
    time: TimeData;
}

export const ScheduleTime: FunctionalComponent<ScheduleTimeProps> = props => (
    <a class="schedule-time" href={`?stop=${props.stop_id}`}>
        <div class="scedule-time__lines lines">
            <span class="line" style={`background-color:${props.color}`} />
            <span class="line" style={`background-color:${props.color}`} />
        </div>
        <span class="schedule-time__name name">{props.name}</span>
        <Time time={props.time} />
    </a>
);

interface ScheduleTimesProps {
    stopTimes: StopTime[];
    color: string;
    stops: Record<string, Pick<Stop, 'name'>>;
}

export const ScheduleTimes = (props: ScheduleTimesProps) => (
    <section class="schedule-time__container">
        {props.stopTimes.map(s => (
            <ScheduleTime
                key={s.stop_id}
                stop_id={s.stop_id}
                color={props.color}
                name={props.stops[s.stop_id].name}
                time={toTime(fromIsoTime(s.time))}
            />
        ))}
    </section>
);
