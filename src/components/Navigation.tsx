import { Component, h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { App } from './App';
import { TimeData, toTime } from './Time';

interface Props {
    now?: Date;
    routes: Map<string, Route>;
    stops: Record<string, Stop>;
    lastUpdated: TimeData;
    maxDistance: number;
}

interface State {
    route_id?: string | null;
    trip_id?: string | null;
    stop_id?: string | null;
}

const GORIDE_LINK_URL_REGEX = /\/s\/([^\/]+)(?:\/([^\/]+))?\/?$/;
/**
 * Converts from a URL to state.
 *
 * Supported formats:
 * - /s/{route_id}/{trip_id}?stop={stop_id}
 * - /s/{route_id}/{trip_id}/?stop={stop_id}
 * - #!route={route_id}&trip={trip_id}&stop={stop_id}
 */
export function urlToState(url: URL | Location) {
    if (url.hash.startsWith('#!')) {
        const params = new URLSearchParams(url.hash.slice(2));
        return {
            route_id: params.get('route'),
            trip_id: params.get('trip'),
            stop_id: params.get('stop'),
        };
    } else {
        const stop_id = new URLSearchParams(url.search).get('stop');
        const match = url.pathname.match(GORIDE_LINK_URL_REGEX);
        return {
            route_id: match ? match[1] : null,
            trip_id: match ? match[2] : null,
            stop_id,
        };
    }
}

export class Navigation extends Component<Props, State> {
    componentDidMount() {
        window.addEventListener('popstate', this.onPopState);
        window.addEventListener('hashchange', this.onPopState);
        this.onPopState();
    }

    onPopState = () => {
        this.setState(urlToState(document.location));
    };

    onLinkClick = (evt: Event) => {
        const clickedLink = (evt.target as Element).closest(
            'a.goride-link',
        ) as HTMLAnchorElement | null;
        if (clickedLink != null) {
            evt.preventDefault();
            const newState = urlToState(new URL(clickedLink.href));
            if (newState.route_id == null) delete newState.route_id;
            if (newState.trip_id == null) delete newState.trip_id;
            if (newState.stop_id == null) delete newState.stop_id;
            this.setState(newState as State);
        }
    };

    render(props: Props, state: State) {
        return (
            <App
                {...props}
                route_id={state.route_id || undefined}
                trip_id={state.trip_id || undefined}
                stop_id={state.stop_id || undefined}
                nowTime={toTime(props.now || new Date())}
                onClick={this.onLinkClick}
            />
        );
    }
}
