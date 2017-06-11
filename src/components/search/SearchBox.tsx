import * as React from 'react';
import SearchResult, { SearchResultProps } from './SearchResult';
import { useDatabase, DatabasesProps } from '../useDatabase';
import { DBSearcher } from './searchDB';
import { getPlacePredictions } from './AutocompleteService';

interface SearchBoxProps {
  bounds?: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral;
  componentRestrictions?: google.maps.places.ComponentRestrictions;
}

interface SearchBoxState {
  dbResults: SearchResultProps[];
  placeResults: SearchResultProps[];
}

class SearchBox
extends React.Component<SearchBoxProps & DatabasesProps, SearchBoxState> {
  dbSearcher: DBSearcher;
  service: google.maps.places.AutocompleteService;

  constructor(props: SearchBoxProps & DatabasesProps) {
    super(props);
  }

  componentWillMount() {
    this.dbSearcher = new DBSearcher(this.props.routeDB, this.props.stopDB);
    this.service = new google.maps.places.AutocompleteService();
  }

  async searchDB(input: string) {
    this.setState({ dbResults: [] });

    const dbResults = await this.dbSearcher.search(input);

    this.setState({ dbResults });
  }

  async searchPlaces(input: string) {
    this.setState({ placeResults: [] });

    const placeResults = await getPlacePredictions(this.service, {
      input,
      bounds: this.props.bounds,
      componentRestrictions: this.props.componentRestrictions,
    });

    this.setState({ placeResults });
  }

  handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const searchTerm = e.target.value;

    this.searchDB(searchTerm);
    this.searchPlaces(searchTerm);
  }

  render() {
    return (
      <div className="search-box-container">
        <input
          type="search"
          className="search-box"
          onChange={this.handleSearch}
        />
        <ul className="search-box-results">
          {this.state.dbResults.map((result, index) => (
            <li
              key={index}
              className="db-result search-result-container"
            >
              <SearchResult {...result} />
            </li>
          ))}
          {this.state.placeResults.map((result, index) => (
            <li
              key={`place:${index}`}
              className="place-result search-result-container"
            >
              <SearchResult {...result} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default useDatabase<SearchBoxProps>('routes', 'stops')(SearchBox);
