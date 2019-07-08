import { ComponentChildren, h } from 'preact';
import { Route } from '../common/api-types';
import { TimeData } from '../common/Time';
import { Header, Information } from './Information';
import { RouteList } from './RouteList';

type RouteData = Pick<Route, 'route_id' | 'color' | 'name'>;

interface Props {
    readonly nearby: Set<Route['route_id']>;
    readonly routes: readonly RouteData[];
    readonly lastUpdated?: TimeData;
    readonly afterNearby: ComponentChildren;
}

export const Sidebar = (props: Props) => {
    const nearby: RouteData[] = [];
    const other = props.routes.filter(route => {
        if (props.nearby.has(route.route_id)) {
            nearby.push(route); // side effect
            return false;
        }
        return true;
    });

    return (
        <aside id="routes" class="routes">
            <Header />
            <RouteList title="Nearby Routes" routes={nearby}>
                {props.afterNearby}
            </RouteList>
            <RouteList title="Other Routes" routes={other} />
            <Information lastUpdated={props.lastUpdated} />
        </aside>
    );
};

export const LocationDisclaimer = (props: { onClick(): void }) => (
    <div class="routes__meta">
        <p>
            To display routes near your location, please grant the
            <button type="button" class="link-button" onClick={props.onClick}>
                Location permission
            </button>
            .
        </p>
    </div>
);
