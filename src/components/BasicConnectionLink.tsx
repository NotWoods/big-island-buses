import * as React from 'react';
import { connect } from 'react-redux';
import { getURL, getStopURL } from '../utils';
import { openConnection } from '../redux/page';

import '../css/ConnectionLink.css';

interface BasicConnectionLinkProps {
  showTitle?: boolean;
  route_id: string;
  stop_id?: string;
  route_color: string;
  route_text_color?: string;
  route_name: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Used to link to connecting routes. Can either be small and only show a color,
 * or large and show the title of the route (determined by showTitle)
 */
const BasicConnectionLink: React.SFC<BasicConnectionLinkProps> = props => {
  let href = getURL(props.route_id);
  if (props.stop_id) { href += getStopURL(props.stop_id); }

  const linkProps: React.HTMLProps<HTMLAnchorElement> = {
    className: 'connection-link',
    style: {
      backgroundColor: `#${props.route_color}`
    },
    href,
    onClick: props.onClick,
    children: '',
  };

  if (props.showTitle) {
    (linkProps.style as React.CSSProperties).color = `#${props.route_text_color || 'fff'}`;
    linkProps.children = props.route_name;
    linkProps.className += ' with-title';
  } else {
    linkProps.title = props.route_name;
  }

  if (props.className) {
    linkProps.className += ` ${props.className}`;
  }

  return <a {...linkProps} />;
};

export default connect(
  null,
  (dispatch, { route_id, stop_id }: BasicConnectionLinkProps) => {
    const onClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
      e.preventDefault();
      dispatch(openConnection(route_id, stop_id || ''));
    };
    return { onClick };
  },
)(BasicConnectionLink);
