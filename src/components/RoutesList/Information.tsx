import { FunctionalComponent, h } from 'preact';
import { Time, TimeData } from '../Time';

const InfoItem: FunctionalComponent<{ href: string }> = props => (
    <li class="side-item">
        <a class="side-item__link" href={props.href}>
            {props.children}
        </a>
    </li>
);

export const Information = (props: { lastUpdated?: TimeData }) => (
    <div>
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
                {props.lastUpdated ? <Time time={props.lastUpdated} /> : '...'}
            </p>
            <p>
                Finding routes near your location requires the Location
                permission.
            </p>
        </div>
    </div>
);
