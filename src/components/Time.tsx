import { h, FunctionalComponent } from 'preact';

export interface TimeData {
    readonly iso: string;
    readonly formatted: string;
}

const TIME_REGEX = /\d+-\d\d-\d\dT(\d\d:\d\d:\d\d).*/;

export const toTime = (t: Date): TimeData => ({
    iso: t.toISOString().match(TIME_REGEX)![1],
    formatted: t.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }),
});

export const toDate = (t: Date): TimeData => ({
    iso: t.toISOString(),
    formatted: t.toLocaleDateString(),
});

export const Time: FunctionalComponent<{ time: TimeData }> = props => (
    <time dateTime={props.time.iso}>{props.time.formatted}</time>
);
