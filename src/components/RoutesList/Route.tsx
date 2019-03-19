import { h, ComponentChildren, FunctionalComponent } from 'preact';

interface RouteProps {
    color: string;
    href: string;
    children: ComponentChildren;
    class?: string;
}

export const RouteItem: FunctionalComponent<
    RouteProps & { class: string }
> = props => (
    <li class={`route ${props.class}`} style={`border-color:${props.color}`}>
        <a class={`route__link ${props.class}__link`} href={props.href}>
            {props.children}
        </a>
    </li>
);
