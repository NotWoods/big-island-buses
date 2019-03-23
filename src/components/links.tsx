import { h } from 'preact';
import clsx from 'clsx';
import { BASE_URL } from '../config';
import { Stop } from '../server-render/api-types';

interface RouteLinkProps extends JSX.HTMLAttributes {
    route_id: string;
}

interface TripLinkProps extends RouteLinkProps {
    trip_id: string;
}

interface StopLinkProps extends JSX.HTMLAttributes {
    stop?: Pick<Stop, 'stop_id' | 'name'>;
}

/** Anchor link that opens a new route. */
export const RouteLink = ({ route_id, ...props }: RouteLinkProps) => (
    <a
        {...props}
        class={clsx(props.class, 'goride-link')}
        href={`/s/${route_id}`}
    />
);

/** Anchor link that opens a route and trip. */
export const TripLink = ({ route_id, trip_id, ...props }: TripLinkProps) => (
    <a
        {...props}
        class={clsx(props.class, 'goride-link')}
        href={`${BASE_URL}/s/${route_id}/${trip_id}`}
    />
);

/**
 * Anchor link that opens a stop. If no stop is given, null is returned.
 */
export const StopLink = ({ stop, ...props }: StopLinkProps) => {
    if (!stop) return null;

    return (
        <a
            children={stop.name}
            {...props}
            class={clsx(props.class, 'goride-link')}
            href={`?stop=${stop.stop_id}`}
        />
    );
};
