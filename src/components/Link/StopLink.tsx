import { h } from 'preact';

interface Props extends JSX.HTMLAttributes {
    stop_id: string;
}

export const StopLink = ({ stop_id, ...props }: Props) => (
    <a {...props} href={`?stop=${stop_id}`} />
);
