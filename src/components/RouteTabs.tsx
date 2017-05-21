import { createElement, SFC } from 'react';

interface RouteTabsProps {
	selected: 'schedule' | 'map'
	onChange(newSelected: 'schedule' | 'map')
	mapDisabled: boolean
}

/**
 * A pair of tabs ('Schedule' and 'Map') to display in a route
 * header.
 */
const RouteTabs: SFC<RouteTabsProps> = props => {
	const { selected, onChange, mapDisabled } = props;
	const useMap = selected === 'map';

	return (
		<nav className="route-tabs">
			<button
				className={'route-tab' + !useMap
					? 'is-selected'
					: ''}
				onClick={useMap ? () => onChange('schedule') : undefined}
			>
				Schedule
			</button>
			<button
				disabled={mapDisabled}
				className={'route-tab' + useMap
					? 'is-selected'
					: ''}
				onClick={!useMap ? () => onChange('map') : undefined}
			>
				Map
			</button>
		</nav>
	);
}

export default RouteTabs;
