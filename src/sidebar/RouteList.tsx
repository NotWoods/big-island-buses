import { FunctionalComponent, h } from 'preact';
import { Route } from '../common/api-types';
import { RouteLink } from '../navigation/links';

interface Props {
    readonly title: string;
    readonly routes: readonly Pick<Route, 'route_id' | 'color' | 'name'>[];
}

export const RouteList: FunctionalComponent<Props> = props => (
    <div>
        <h2 class="routes__heading">{props.title}</h2>
        <ul class="routes__list" id="other">
            {props.routes.map(route => (
                <li
                    key={route.route_id}
                    class="side-item"
                    style={{ 'border-color': route.color }}
                >
                    <RouteLink
                        class="route__link side-item__link"
                        route={route}
                    />
                </li>
            ))}
        </ul>
        {props.children}
    </div>
);
