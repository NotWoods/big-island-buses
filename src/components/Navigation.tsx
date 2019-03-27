import { Component, h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { LocationApp } from './Location';
import { TimeData, toTime } from './Time';
import { BASE_URL } from '../config';

interface Props {
    now?: Date;
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    lastUpdated?: TimeData;
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
 * - /
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
        const stop_id = new URLSearchParams(url.search.slice(1)).get('stop');
        const match = url.pathname.match(GORIDE_LINK_URL_REGEX);
        return {
            route_id: match ? match[1] : null,
            trip_id: match ? match[2] : null,
            stop_id,
        };
    }
}

export class NavigationApp extends Component<Props, State> {
    componentDidMount() {
        window.addEventListener('popstate', this.onPopState);
        window.addEventListener('hashchange', this.onPopState);
        this.onPopState();
    }

    title() {
        const { route_id } = this.state;
        let title = 'Big Island Buses';
        if (route_id && this.props.routes) {
            const route = this.props.routes.get(route_id);
            title = `${route ? route.name : '404'} | ${title}`;
        }
        document.title = title;
        return title;
    }

    onPopState = () => {
        this.setState(urlToState(location));
    };

    onLinkClick = (evt: Event) => {
        const clickedLink = (evt.target as Element).closest(
            'a.goride-link',
        ) as HTMLAnchorElement | null;
        if (clickedLink != null) {
            evt.preventDefault();
            const newUrl = new URL(clickedLink.href, location.href);
            if (!newUrl.search) newUrl.search = location.search;
            const newState = urlToState(newUrl);
            const isHistoryChange =
                newState.route_id !== this.state.route_id ||
                newState.trip_id !== this.state.trip_id;
            this.setState(newState as State, () => {
                const title = this.title();
                if (isHistoryChange) {
                    history.pushState(null, title, clickedLink.href);
                } else {
                    history.replaceState(null, title, clickedLink.href);
                }
            });
        }
    };

    onTripSelectChange = (evt: Event) => {
        const select = evt.target as HTMLSelectElement;
        if (select.matches('.schedule-info__select')) {
            const trip_id = select.value;
            this.setState({ trip_id }, () => {
                const title = this.title();
                history.pushState(
                    null,
                    title,
                    `${BASE_URL}/s/${this.state.route_id}/${trip_id}`,
                );
            });
        }
    };

    onOpenStop = (stop_id: string) => {
        this.setState({ stop_id }, () => {
            const title = this.title();
            history.replaceState(null, title, `?stop=${stop_id}`);
        });
    };

    render(props: Props, state: State) {
        return (
            <LocationApp
                {...props}
                route_id={state.route_id || undefined}
                trip_id={state.trip_id || undefined}
                stop_id={state.stop_id || undefined}
                nowTime={toTime(props.now || new Date())}
                onClick={this.onLinkClick}
                onChange={this.onTripSelectChange}
                onOpenStop={this.onOpenStop}
            />
        );
    }
}
