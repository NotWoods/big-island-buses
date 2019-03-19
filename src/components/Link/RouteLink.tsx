import { h } from 'preact';

interface Props extends JSX.HTMLAttributes {
    route_id: string;
}

export const RouteLink = ({ route_id, ...props }: Props) => (
    <a {...props} href={`/${route_id}`} />
);
