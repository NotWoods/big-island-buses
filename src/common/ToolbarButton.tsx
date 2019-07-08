import { h, ComponentChildren } from 'preact';

export const ToolbarButton = (props: {
    id?: string;
    title: string;
    children: ComponentChildren;
}) => (
    <button
        class="toolbar__button"
        type="button"
        id={props.id}
        title={props.title}
        aria-label={props.title}
    >
        {props.children}
    </button>
);

export const MenuButton = (props: { id?: string; fill?: string }) => (
    <ToolbarButton title="Menu" id={props.id}>
        <svg class="icon" viewBox="0 0 24 24" fill={props.fill}>
            <path d="M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z" />
        </svg>
    </ToolbarButton>
);
