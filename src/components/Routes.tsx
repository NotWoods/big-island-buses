import { h, ComponentChildren } from 'preact';
import { Header } from './Header';

interface RouteProps {
    key?: string;
    color: string;
    href: string;
    children: ComponentChildren;
}

const Route = (props: RouteProps) => (
    <li class="side-item route" style={`border-color:${props.color}`}>
        <a class="side-item__link route__link" href={props.href}>
            {props.children}
        </a>
    </li>
);

const InfoItem = (props: Pick<RouteProps, 'href' | 'children'>) => (
    <li class="side-item">
        <a class="side-item__link" href={props.href}>
            {props.children}
        </a>
    </li>
);

interface RoutesProps {
    nearby: RouteProps[];
    other: RouteProps[];
    lastUpdated: Date;
}

export const Routes = (props: RoutesProps) => (
    <aside id="routes" class="routes">
        <Header />
        <h2 class="routes__heading">Nearby Routes</h2>
        <ul class="routes__list" id="nearby">
            {props.nearby.map(p => (
                <Route key={p.href} {...p} />
            ))}
        </ul>
        <h2 class="routes__heading">Other Routes</h2>
        <ul class="routes__list" id="other">
            {props.other.map(p => (
                <Route key={p.href} {...p} />
            ))}
        </ul>
        <h2 class="routes__heading">Information</h2>
        <ul class="routes__list" id="info">
            <InfoItem href="about.html">About this app</InfoItem>
            <InfoItem href="http://www.heleonbus.org/how-to-ride-hele-on/rules-and-regulations/">
                Rules and Regulations
            </InfoItem>
            <InfoItem href="http://www.heleonbus.org/how-to-ride-hele-on/fares-and-fees/">
                Fares and Fees
            </InfoItem>
            <InfoItem href="http://www.heleonbus.org/how-to-ride-hele-on/getting-on-and-off/">
                Getting on and off
            </InfoItem>
        </ul>
        <div class="routes__meta">
            <p>
                Created by <a href="https://tigeroakes.com">Tiger Oakes</a>
            </p>
            <p>
                {'Last updated '}
                <time dateTime={props.lastUpdated.toISOString()}>
                    {props.lastUpdated.toLocaleDateString()}
                </time>
            </p>
            <p>
                Finding routes near your location requires the Location
                permission.
            </p>
        </div>
    </aside>
);
