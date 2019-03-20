import { h, FunctionalComponent } from 'preact';
import { toIsoTime, toIsoDate } from '../server-render/parse-date';

declare namespace Intl {
    class RelativeTimeFormat {
        constructor(locale?: string, options?: object);
        format(value: number, unit: string): string;
    }
}

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

export const toDuration = ({ minute }: { minute: number }) => {
    let formatted: string;
    if (Intl.RelativeTimeFormat) {
        formatted = new Intl.RelativeTimeFormat().format(minute, 'minute');
    } else if (minute === 1) {
        formatted = '1 minute';
    } else {
        formatted = `${minute} minutes`;
    }
    return {
        iso: `PT${minute}M`,
        formatted,
    };
};

export const Time: FunctionalComponent<{ time: TimeData }> = props => (
    <time dateTime={props.time.iso}>{props.time.formatted}</time>
);
