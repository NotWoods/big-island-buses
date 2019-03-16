import { h } from 'preact';
import { RouteHeader } from './RouteHeader';
import { Map } from './Map';
import { ScheduleInfo } from './ScheduleInfo';
import { ScheduleTimes } from './ScheduleTimes';

export const App = () => (
    <div>
        <Routes />
        <main id="main" class="open-stop open">
            <Map />
            <div id="content">
                <RouteHeader />
                <div id="schedule-column">
                    <ScheduleInfo />
                    <ScheduleTimes />
                </div>
                <div class="float-clear" />
            </div>
        </main>
    </div>
);
