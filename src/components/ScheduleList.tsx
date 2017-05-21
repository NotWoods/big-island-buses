import { createElement, SFC } from 'react';
import ScheduleRow, { ScheduleRowProps } from './ScheduleRow';
import SiblingTripLink from './SiblingTripLink';

export interface ScheduleListProps {
	route_id: string
	items: ScheduleRowProps[]
	prev_trip_id: string
	prev_trip_name: string
	next_trip_id: string
	next_trip_name: string
}

/**
 * Displays a trip schedule
 */
const ScheduleList: SFC<ScheduleListProps> = props => (
	<div className="schedule-list-container">
		<SiblingTripLink
			mode="prev"
			route_id={props.route_id}
			trip_id={props.prev_trip_id}
			trip_name={props.prev_trip_name}
		/>
		<ul className="schedule-list">
			{props.items.map((item, index) => (
				<ScheduleRow key={index} {...item} />
			))}
		</ul>
		<SiblingTripLink
			mode="next"
			route_id={props.route_id}
			trip_id={props.next_trip_id}
			trip_name={props.next_trip_name}
		/>
	</div>
);

export default ScheduleList;
