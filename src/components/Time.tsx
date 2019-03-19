import { h, FunctionalComponent } from 'preact';
import { toIsoTime, toIsoDate } from '../server-render/parse-date';

export interface TimeData {
    readonly iso: string;
    readonly formatted: string;
}

export const toTime = (t: Date): TimeData => ({
    iso: toIsoTime(t),
    formatted: t.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }),
});

export const toDate = (t: Date): TimeData => ({
    iso: toIsoDate(t),
    formatted: t.toLocaleDateString(),
});

export const Time: FunctionalComponent<{ time: TimeData }> = props => (
    <time dateTime={props.time.iso}>{props.time.formatted}</time>
);
