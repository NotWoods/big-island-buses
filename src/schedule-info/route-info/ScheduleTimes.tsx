import { FunctionalComponent, h } from 'preact';
import { Stop, StopTime } from '../../common/api-types';
import { fromIsoTime } from '../../common/parse-date';
import { Time, TimeData, toTime } from '../../common/Time';
import { StopLink } from '../../navigation/links';

interface ScheduleTimeProps {
    stop_id: string;
    color: string;
    name: string;
    time: TimeData;
}

export const ScheduleTime: FunctionalComponent<ScheduleTimeProps> = props => {
    const css = { 'background-color': props.color };
    return (
        <StopLink class="schedule-time" stop={props}>
            <div class="schedule-time__lines lines">
                <span class="line line--dash" style={css} />
                <span class="line line--dot" style={css} />
            </div>
            <span class="schedule-time__name name">{props.name}</span>
            <Time class="schedule-time__time" time={props.time} />
        </StopLink>
    );
};

interface ScheduleTimesProps {
    stopTimes: StopTime[];
    color: string;
    stops?: Record<string, Pick<Stop, 'name'>>;
}

export const ScheduleTimes = (props: ScheduleTimesProps) => (
    <section class="schedule-time__container">
        {props.stopTimes.map(s => (
            <ScheduleTime
                key={s.stop_id}
                stop_id={s.stop_id}
                color={props.color}
                name={props.stops ? props.stops[s.stop_id].name : ''}
                time={toTime(fromIsoTime(s.time))}
            />
        ))}
    </section>
);
