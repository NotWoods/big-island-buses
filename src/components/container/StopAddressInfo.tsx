import * as React from 'react';
import {
  stopAddress,
  Stop,
} from 'query-pouch-gtfs';

interface StopAddressInfoProps {
  lat?: number;
  lng?: number;
  id?: string;
  apiKey?: string;
  children?: string;
}

interface StopAddressInfoState {
  address: string;
}

/**
 * Displays the address of a stop
 */
export default class StopAddressInfo
extends React.Component<StopAddressInfoProps, StopAddressInfoState> {
  constructor(props: StopAddressInfoProps) {
    super(props);
    this.state = { address: '...' };
  }

  componentDidMount() {
    if (!this.props.children && this.props.lat && this.props.lng) {
      this.loadAddress(this.props.lat, this.props.lng);
    }
  }

  componentWillReceiveProps(nextProps: StopAddressInfoProps) {
    if (nextProps.lat && nextProps.lat !== this.props.lat
    && nextProps.lng && nextProps.lng !== this.props.lng
    && !nextProps.children) {
      this.loadAddress(nextProps.lat, nextProps.lng);
    }
  }

  async loadAddress(lat: number, lng: number) {
    this.setState({ address: '' });

    const stop: Partial<Stop> = {
      stop_lat: lat,
      stop_lon: lng,
      stop_id: this.props.id,
    };

    const address = await stopAddress(this.props.apiKey || '')(stop as Stop);
    this.setState({ address });
  }

  render() {
    return (
      <p
        title="Bus stop address"
        className="info-text stop-info-text stop-address"
      >
        {this.props.children || this.state.address}
      </p>
    );
  }
}
