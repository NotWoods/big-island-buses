import { h } from 'preact';
import clsx from 'clsx';
import { Stop } from '../../server-render/api-types';

interface Props extends JSX.HTMLAttributes {
    stop?: Pick<Stop, 'stop_id' | 'name'>;
}

export const StopLink = ({ stop, ...props }: Props) => {
    if (!stop) return null;

    return (
        <a
            {...props}
            class={clsx(props.class, 'goride-link')}
            href={`?stop=${stop.stop_id}`}
        >
            {stop.name}
        </a>
    );
};
