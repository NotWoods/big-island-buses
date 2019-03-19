import { h, ComponentChildren, FunctionalComponent } from 'preact';

export const InfoItem: FunctionalComponent<{
    id?: string;
    title: string;
    spanId?: string;
    icon: ComponentChildren;
}> = props => (
    <div
        class="schedule-info__item"
        id={props.id}
        title={props.title}
        aria-label={props.title}
    >
        <svg viewBox="0 0 24 24" alt={props.title}>
            {props.icon}
        </svg>
        <span class="schedule-info__item-value" id={props.spanId}>
            {props.children}
        </span>
    </div>
);
