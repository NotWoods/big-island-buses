import * as React from 'react';

export interface BusRouteInfoProps {
	location: {
		first_stop_id: string,
		first_stop_name: string,
		last_stop_id: string
		last_stop_name: string,
	} | null,
}

/**
 * Displays text representing the first and last stop of the bus
 * route, and links to those specific stops
 */
const BusRouteInfo: React.SFC<BusRouteInfoProps> = props => {
	let location: React.ReactNode = null;

	if (props.location) {
		const {
			first_stop_id, first_stop_name,
			last_stop_id, last_stop_name,
		} = props.location;

		location = [
			<a className="invsible" href={`?stop_id=${first_stop_id}`}>
				{first_stop_name}
			</a>,
			' - ',
			<a className="invsible" href={`?stop_id=${last_stop_id}`}>
				{last_stop_name}
			</a>,
		];
	}

	return (
		<p
			title="Bus route location"
			className="info-text route-info-text route-location"
		>
			{location}
		</p>
	);
}

export default BusRouteInfo;
