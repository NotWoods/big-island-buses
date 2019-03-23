import { ComponentChildren, h, FunctionalComponent } from 'preact';
import { RouteItem } from './Route';
import { TimeData } from '../Time';
import { Information, Header } from './Information';

export interface RouteData {
    color: string;
    route_id: string;
    name: string;
}

const RouteList: FunctionalComponent<{
    title: string;
    routes: RouteData[];
}> = props => (
    <div>
        <h2 class="routes__heading">{props.title}</h2>
        <ul class="routes__list" id="other">
            {props.routes.map(p => (
                <RouteItem class="side-item" key={p.route_id} {...p} />
            ))}
        </ul>
        {props.children}
    </div>
);

interface RoutesProps {
    nearby: Set<string>;
    routes: RouteData[];
    lastUpdated?: TimeData;
    afterNearby: ComponentChildren;
}

export const Routes = (props: RoutesProps) => {
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
