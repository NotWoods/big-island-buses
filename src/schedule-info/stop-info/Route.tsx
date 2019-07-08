import { FunctionalComponent, h } from 'preact';
import { RouteLink } from '../../navigation/links';
import { Route } from '../../common/api-types';

interface RouteProps {
    route?: Pick<Route, 'color' | 'route_id' | 'name'>;
}

export const RouteItem: FunctionalComponent<RouteProps> = props => {
    if (!props.route) return null;
    return (
        <li
            class={`route connection`}
            style={{ 'border-color': props.route.color }}
        >
            <RouteLink
                class={`route__link connection__link`}
                route={props.route}
            />
        </li>
    );
};
