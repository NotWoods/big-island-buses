import { FunctionalComponent, h } from 'preact';
import { RouteLink } from '../Link';

interface RouteProps {
    color: string;
    route_id: string;
    name: string;
    class?: string;
}

export const RouteItem: FunctionalComponent<
    RouteProps & { class: string }
> = props => (
    <li class={`route ${props.class}`} style={`border-color:${props.color}`}>
        <RouteLink
            class={`route__link ${props.class}__link`}
            route_id={props.route_id}
        >
            {props.name}
        </RouteLink>
    </li>
);
