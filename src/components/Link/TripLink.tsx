import { h } from 'preact';
import clsx from 'clsx';
import { BASE_URL } from '../../config';

interface Props extends JSX.HTMLAttributes {
    route_id: string;
    trip_id: string;
}

export const TripLink = ({ route_id, trip_id, ...props }: Props) => (
    <a
        {...props}
        class={clsx(props.class, 'goride-link')}
        href={`${BASE_URL}/s/${route_id}/${trip_id}`}
    />
);
