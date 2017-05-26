import * as React from 'react';

export interface StopStreetViewProps {
	fallbackURL: string
}

/**
 * Shows street view at the location of a stop
 */
export default class StopStreetView extends React.Component<StopStreetViewProps, void> {
	render() {
		return (
			<div className="stop-street-view">
				<img
					className="street-view-fallback" alt=""
					src={this.props.fallbackURL}
				/>
			</div>
		)
	}
}
