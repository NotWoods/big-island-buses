import clsx from 'clsx';
import { h, JSX, toChildArray } from 'preact';
import { Stop, Route, Trip } from '../../server-render/api-types';
import { stopToUrl, tripToUrl, routeToUrl } from './url';

interface RouteLinkProps extends JSX.HTMLAttributes {
    route?: Pick<Route, 'route_id' | 'name'>;
}

interface TripLinkProps extends RouteLinkProps {
    trip?: Pick<Trip, 'trip_id' | 'route_id' | 'name'>;
}

interface StopLinkProps extends JSX.HTMLAttributes {
    stop?: Pick<Stop, 'stop_id' | 'name'>;
}

const LINK_CLASS = 'goride-link';

/**
 * Anchor link that opens a new route.
 * If no route is given, nothing is rendered.
 */
export function RouteLink({ route, ...props }: RouteLinkProps) {
    if (!route) return null;
    return (
        <a
            {...props}
            class={clsx(props.class, LINK_CLASS)}
            href={routeToUrl(route)}
        >
            {childrenOrDefault(props, route.name)}
        </a>
    );
}

/**
 * Anchor link that opens a route and trip.
 * If no trip is given, nothing is rendered.
 */
export function TripLink({ trip, ...props }: TripLinkProps) {
    if (!trip) return null;
    return (
        <a
            {...props}
            class={clsx(props.class, LINK_CLASS)}
            href={tripToUrl(trip)}
        >
            {childrenOrDefault(props, trip.name)}
        </a>
    );
}

/**
 * Anchor link that opens a stop.
 * If no stop is given, nothing is rendered.
 */
export function StopLink({ stop, ...props }: StopLinkProps) {
    if (!stop) return null;
    return (
        <a
            {...props}
            class={clsx(props.class, LINK_CLASS)}
            href={stopToUrl(stop)}
        >
            {childrenOrDefault(props, stop.name)}
        </a>
    );
}

function childrenOrDefault(props: JSX.HTMLAttributes, fallback: string) {
    const children = toChildArray(props.children);
    return children.length > 0 ? children : fallback;
}

export function findClickedNavLink(evt: Event) {
    return (evt.target as Element).closest(
        `a.${LINK_CLASS}`,
    ) as HTMLAnchorElement | null;
}
