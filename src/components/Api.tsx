import { Component, h } from 'preact';
import { LatLngBoundsLiteral } from 'spherical-geometry-js';
import { BASE_URL } from '../config';
import { Route, Stop } from '../common/api-types';
import { NavigationApp } from './Navigation';
import { TimeData, toDate } from '../common/Time';

interface Props {
    now?: Date;
    maxDistance: number;
}

interface State {
    routes?: Map<Route['route_id'], Route>;
    stops?: Map<Stop['stop_id'], Stop>;
    lastUpdated?: TimeData;
    bounds?: LatLngBoundsLiteral;
}

export class ApiApp extends Component<Props, State> {
    componentDidMount() {
        const json = (res: Response) => res.json();

        fetch(`${BASE_URL}/api/routes.json`)
            .then(json)
            .then(({ routes, bounds }) => {
                this.setState({
                    routes: new Map<string, Route>(
                        routes.map((route: Route) => [route.route_id, route]),
                    ),
                    bounds: bounds,
                });
            });

        fetch(`${BASE_URL}/api/stops.json`)
            .then(json)
            .then(stops => this.setState({ stops }));

        fetch(`${BASE_URL}/api/version.json`)
            .then(json)
            .then(version =>
                this.setState({
                    lastUpdated: toDate(new Date(version.last_updated)),
                }),
            );
    }

    render(props: Props, state: State) {
        return <NavigationApp {...props} {...state} />;
    }
}
