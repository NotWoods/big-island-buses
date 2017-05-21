import { createElement, SFC } from 'react';

/**
 * An up button that returns to the routes page
 */
const RoutesButton: SFC<void> = () => (
	<a
		className="toolbar-button up-button"
		href="/routes"
		title="Up to Routes"
	>
		<img width={24} height={24} src=""/>
	</a>
)

export default RoutesButton;
