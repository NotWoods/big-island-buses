import { h } from 'preact';
import { Trip } from '../../common/api-types';
import { InfoItem } from '../InfoItem';

interface SelectTripProps {
    readonly trips: readonly Pick<Trip, 'trip_id' | 'name'>[];
    readonly trip_id?: Trip['trip_id'];
}

export const SelectTrip = (props: SelectTripProps) => (
    <InfoItem
        id="trip-select-container"
        title="Select different trip"
        icon={<path d="M10,18h4v-2h-4V18z M3,6v2h18V6H3z M6,13h12v-2H6V13z" />}
    >
        <select
            class="schedule-info__select"
            id="trip-select"
            aria-label="Select different trip"
            value={props.trip_id}
            disabled={props.trips.length === 0}
        >
            {props.trips.map(t => (
                <option key={t.trip_id} value={t.trip_id}>
                    {t.name}
                </option>
            ))}
        </select>
    </InfoItem>
);
