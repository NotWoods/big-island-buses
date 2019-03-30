import { Component, h } from 'preact';
import { Route, Stop } from '../server-render/api-types';
import { NavigationApp } from './Navigation';
import { TimeData, toDate } from './Time';
import { BASE_URL } from '../config';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';

interface Props {
    now?: Date;
    maxDistance: number;
}

interface State {
    routes?: Map<string, Route>;
    stops?: Record<string, Stop>;
    lastUpdated?: TimeData;
    bounds?: LatLngBoundsLiteral;
}

export class ApiApp extends Component<Props, State> {
    async componentDidMount() {
        const json = (res: Response) => res.json();
        const [
            { routes: routesRes, bounds },
            stops,
            version,
        ] = await Promise.all([
            fetch(`${BASE_URL}/api/routes.json`).then(json),
            fetch(`${BASE_URL}/api/stops.json`).then(json),
            fetch(`${BASE_URL}/api/version.json`).then(json),
        ]);

        const routes = new Map<string, Route>(
            routesRes.map((route: Route) => [route.route_id, route]),
        );
        this.setState({
            routes,
            stops,
            bounds,
            lastUpdated: toDate(new Date(version.last_updated)),
        });
    }

    render(props: Props, state: State) {
        return <NavigationApp {...props} {...state} />;
    }
}
