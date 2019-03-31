import { Component, h } from 'preact';
import { MenuButton } from '../components/ToolbarButton';
import { SearchResult } from './worker';

interface State {
    value: string;
    results: SearchResult[];
}

export class SearchBar extends Component<{}, State> {
    onChange = (event: Event) => {
        this.setState({ value: (event.target as HTMLInputElement).value });
        // TODO call worker
    };

    render(_: {}, { value, results }: State) {
        return (
            <header class="map__header toolbar" id="map-header">
                <MenuButton id="menu" />
                <input
                    type="search"
                    name="Map Search"
                    id="search"
                    class="toolbar__search"
                    aria-label="Enter a location"
                    placeholder="Enter a location"
                    autocomplete="off"
                    value={value}
                    onChange={this.onChange}
                />
                <ul class="toolbar__search-results">
                    {results.map(result => (
                        <li class="toolbar__result-container" key={result.id}>
                            <button
                                type="button"
                                class="toolbar__result"
                                data-type={result.type}
                                data-id={result.id}
                            >
                                {result.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </header>
        );
    }
}
