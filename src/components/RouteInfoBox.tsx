import { createElement, SFC } from 'react';
import BusRouteInfo, { BusRouteInfoProps } from './BusRouteInfo';
import NextStopInfo, { NextStopInfoProps } from './NextStopInfo';

type RouteInfoBoxProps = BusRouteInfoProps & NextStopInfoProps;

/**
 * An info box displaying some data relevant to the route.
 */
const RouteInfoBox: SFC<RouteInfoBoxProps> = props => {
	return (
		<div className="info-box">
			<BusRouteInfo location={props.location} />
			<NextStopInfo nextStop={props.nextStop} now={props.now} />
		</div>
	);
}

export default RouteInfoBox;
