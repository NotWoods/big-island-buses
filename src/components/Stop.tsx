import { createElement, Component } from 'react';
import StopStreetView from './StopStreetView';
import StopName from './StopName';
import StopAddressInfo from './StopAddressInfo';
import ConnectionLink from './ConnectionLink';

export interface StopProps {
	stop_name: string
	address: string
	fallbackURL: string
	routes: {
		route_id: string
		route_color: string
		route_name: string
		route_text_color: string
	}[]
}

export default class Stop extends Component<StopProps, void> {
	render() {
		return (
			<article className="list">
				<header className="info stop-info">
					<StopStreetView fallbackURL={this.props.fallbackURL} />

					<StopName>{this.props.stop_name}</StopName>

					<div className="info-box">
						<StopAddressInfo address={this.props.address} />
					</div>
				</header>

				<h3 className="route-list-header">Connects to</h3>
				<ul className="route-list">
					{this.props.routes.map(route => (
						<li className="route-list-item">
							<ConnectionLink showTitle {...route} />
						</li>
					))}
				</ul>
			</article>
		);
	}
}
