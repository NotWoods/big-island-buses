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

    stops?: Map<Stop['stop_id'], Stop>;
}

export const ScheduleTimes: FunctionalComponent<ScheduleTimesProps> = ({
    stopTimes,
    color,
    stops = new Map<Stop['stop_id'], Stop>(),
}) => (
    <section class="schedule-time__container">
        {stopTimes.map(({ stop_id, time }) => {
            const stop = stops.get(stop_id);
            return (
                <ScheduleTime
                    key={stop_id}
                    stop_id={stop_id}
                    color={color}
                    name={stop ? stop.name : ''}
                    time={toTime(fromIsoTime(time))}
                />
            );
        })}
    </section>
);
