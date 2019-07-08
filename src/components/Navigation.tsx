import { Component, h } from 'preact';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';
import { APP_NAME } from '../config';
import { findClickedNavLink } from '../navigation/links';
import {
    NavigationState,
    shouldPushHistory,
    stopToUrl,
    tripToUrl,
    urlToState,
} from '../navigation/url';
import { Route, Stop } from '../common/api-types';
import { TimeData, toTime } from '../common/Time';
import { LocationApp } from './Location';

interface Props {
    now?: Date;
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    bounds?: LatLngBoundsLiteral;
    lastUpdated?: TimeData;
    maxDistance: number;
}

export class NavigationApp extends Component<Props, NavigationState> {
    componentDidMount() {
        window.addEventListener('popstate', this.onPopState);
        window.addEventListener('hashchange', this.onPopState);
        this.onPopState();
    }

    /**
     * Generate a title for the page, and display it.
     */
    title() {
        const { route_id } = this.state;
        let title = APP_NAME;
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
        const clickedLink = findClickedNavLink(evt);
        if (clickedLink != undefined) {
            evt.preventDefault();
            // Copy base from the current location over, including search params
            const newUrl = new URL(clickedLink.href, location.href);
            if (!newUrl.search) newUrl.search = location.search;

            const oldState = this.state;
            const newState = urlToState(newUrl);
            this.setState(newState, () => {
                const title = this.title();
                if (shouldPushHistory(oldState, newState)) {
                    history.pushState(undefined, title, clickedLink.href);
                } else {
                    history.replaceState(undefined, title, clickedLink.href);
                }
            });
        }
    };

    onTripSelectChange = (evt: Event) => {
        const select = evt.target as HTMLSelectElement;
        if (select.matches('.schedule-info__select')) {
            const trip_id = select.value;
            this.setState({ trip_id }, () => {
                history.pushState(
                    undefined,
                    this.title(),
                    tripToUrl({ trip_id, route_id: this.state.route_id! }),
                );
            });
        }
    };

    onOpenStop = (stop_id: string) => {
        this.setState({ stop_id }, () => {
            history.replaceState(
                undefined,
                this.title(),
                stopToUrl({ stop_id }),
            );
        });
    };

    render(props: Props, state: NavigationState) {
        return (
            <LocationApp
                {...props}
                route_id={state.route_id}
                trip_id={state.trip_id}
                stop_id={state.stop_id}
                nowTime={toTime(props.now || new Date())}
                onClick={this.onLinkClick}
                onChange={this.onTripSelectChange}
                onOpenStop={this.onOpenStop}
            />
        );
    }
}
