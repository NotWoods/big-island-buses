import { Component, h, ComponentChildren } from 'preact';

interface Props {
    ms: number;
    children?: ComponentChildren;
}

interface State {
    timeoutPassed: boolean;
}

/**
 * Render a component after some timeout.
 */
export class AfterTimeout extends Component<Props, State> {
    componentDidMount() {
        setTimeout(() => this.setState({ timeoutPassed: true }), this.props.ms);
    }

    render({ children = null }: Props, { timeoutPassed }: State) {
        return timeoutPassed ? children : null;
    }
}
