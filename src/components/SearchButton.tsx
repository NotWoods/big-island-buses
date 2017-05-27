import * as React from 'react';

interface SearchButtonProps {
  onClick(): void;
}

/**
 * A search button for the toolbar
 */
const SearchButton: React.SFC<SearchButtonProps> = (props) => (
  <button
    type="button"
    className="toolbar-button search-button"
    onClick={props.onClick}
    title="Search"
  >
    <img width={24} height={24} src=""/>
  </button>
);

export default SearchButton;
