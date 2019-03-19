import { h } from 'preact';
import clsx from 'clsx';

interface Props extends JSX.HTMLAttributes {
    stop_id: string;
}

export const StopLink = ({ stop_id, ...props }: Props) => (
    <a
        {...props}
        class={clsx(props.class, 'goride-link')}
        href={`?stop=${stop_id}`}
    />
);
