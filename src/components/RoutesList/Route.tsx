import { FunctionalComponent, h } from 'preact';
import { RouteLink } from '../navigation/links';
import { Route } from '../../server-render/api-types';

interface RouteProps {
    route?: Pick<Route, 'color' | 'route_id' | 'name'>;
    class: string;
}

export const RouteItem: FunctionalComponent<RouteProps> = props => {
    if (!props.route) return null;
    return (
        <li
            class={`route ${props.class}`}
            style={{ 'border-color': props.route.color }}
        >
            <RouteLink
                class={`route__link ${props.class}__link`}
                route={props.route}
            />
        </li>
    );
};
