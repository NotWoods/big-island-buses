import { h } from 'preact';

interface Props extends JSX.HTMLAttributes {
    route_id: string;
    trip_id: string;
}

export const TripLink = ({ route_id, trip_id, ...props }: Props) => (
    <a {...props} href={`/${route_id}/${trip_id}`} />
);
