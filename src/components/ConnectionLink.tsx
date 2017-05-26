import * as React from 'react';
import { getURL } from '../utils';

interface ConnectionLinkSmallProps {
	showTitle?: false
	route_id: string
	route_color: string
	route_name: string
}

interface ConnectionLinkLargeProps {
	showTitle: true
	route_id: string
	route_color: string
	route_text_color: string
	route_name: string
}

export type ConnectionLinkProps = ConnectionLinkSmallProps | ConnectionLinkLargeProps;

/**
 * Used to link to connecting routes. Can either be small and only show a color,
 * or large and show the title of the route (determined by showTitle)
 */
const ConnectionLink: React.SFC<ConnectionLinkProps> = props => {
	const linkProps: React.HTMLProps<HTMLAnchorElement> = {
		className: 'connection-link',
		style: {
			backgroundColor: `#${props.route_color}`
		},
		href: getURL(props.route_id),
		children: ''
	}

	if (props.showTitle) {
		(linkProps.style as React.CSSProperties).color = `#${props.route_text_color}`
		linkProps.children = props.route_name;
	} else {
		linkProps.title = props.route_name;
	}

	return <a {...linkProps} />
}

export default ConnectionLink;
