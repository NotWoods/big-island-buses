import { h } from 'preact';
import clsx from 'clsx';

interface Props extends JSX.HTMLAttributes {
    route_id: string;
    trip_id: string;
}

export const TripLink = ({ route_id, trip_id, ...props }: Props) => (
    <a
        {...props}
        class={clsx(props.class, 'goride-link')}
        href={`/s/${route_id}/${trip_id}`}
    />
);
