import { h } from 'preact';
import clsx from 'clsx';

interface Props extends JSX.HTMLAttributes {
    route_id: string;
}

export const RouteLink = ({ route_id, ...props }: Props) => (
    <a
        {...props}
        class={clsx(props.class, 'goride-link')}
        href={`/s/${route_id}`}
    />
);
