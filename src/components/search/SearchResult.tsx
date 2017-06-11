import * as React from 'react';
import { getURL, getStopURL } from '../../utils';

export interface SearchResultProps {
  matched: string;
  text: string;
  iconClass: string;
  iconStyle?: React.CSSProperties;
  type?: 'place' | 'route' | 'stop';
  id: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * A single search result. Should be displayed in a list under
 * a search box
 */
const SearchResult: React.SFC<SearchResultProps> = props => {
  let href = '#';
  switch (props.type) {
    case 'route':
      href = getURL(props.id);
      break;
    case 'stop':
      href = getStopURL(props.id);
      break;
    case 'place': break;
    default: throw new Error('Invalid type');
  }

  const text: React.ReactNode[] = [];
  const lowercase = props.text.toLowerCase();
  const match = props.matched.toLowerCase();
  let fromIndex = 0;
  while (fromIndex < props.text.length) {
    const index = lowercase.indexOf(match, fromIndex);
    text.push(props.text.slice(fromIndex, index));
    text.push(<strong>{props.text.slice(index, match.length)}</strong>);
  }

  return (
    <a
      className="search-result"
      onClick={props.onClick}
      href={href}
    >
      <i
        className={`search-result-icon ${props.iconClass}`}
        style={props.iconStyle}
      />
      <span className="search-text">{text}</span>
    </a>
  );
};

export default SearchResult;
