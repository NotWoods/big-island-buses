import { Component, ComponentChildren } from 'preact';

interface Props {
    readonly ms: number;
    readonly children?: ComponentChildren;
}

interface State {
    readonly timeoutPassed: boolean;
}

/**
 * Render a component after some timeout.
 */
export class AfterTimeout extends Component<Props, State> {
    componentDidMount() {
        setTimeout(() => this.setState({ timeoutPassed: true }), this.props.ms);
    }

    render({ children = null }: Props, { timeoutPassed }: State) {
        const isServer = typeof window === 'undefined';
        return isServer || timeoutPassed ? children : null;
    }
}
