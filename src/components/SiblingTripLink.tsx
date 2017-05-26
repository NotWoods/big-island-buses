import * as React from 'react';
import { getURL } from '../utils';

export interface SiblingTripLinkProps {
	mode: 'prev' | 'next'
	trip_id: string
	route_id: string
	trip_name: string
}

/**
 * Displays a link to a sibling trip, meant to bookend a trip schedule.
 */
const SiblingTripLink: React.SFC<SiblingTripLinkProps> = props => (
	<div className={`change-trip ${props.mode}-trip`}>
		<i className="change-trip-icon" />
		<a className="change-trip-text" href={getURL(props.route_id, props.trip_id)}>
			{props.trip_name}
		</a>
	</div>
);

export default SiblingTripLink;
