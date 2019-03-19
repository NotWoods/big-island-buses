import { h, Component } from 'preact';
import { Map } from './Map';
import { Routes } from './RoutesList/Routes';

interface Props {}

export class App extends Component<Props> {
    render(props: Props) {
        return (
            <div>
                <Routes />
                <main id="main" class="open-stop open">
                    <Map />
                    <RouteInfo key={}>
                </main>
            </div>
        );
    }
}
