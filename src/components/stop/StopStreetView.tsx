import * as React from 'react';

export interface StopStreetViewProps {
  stop_lat?: number;
  stop_lon?: number;
  address?: string;
  width: number;
  height: number;
  apiKey: string;
}

/**
 * Shows street view at the location of a stop
 */
export default class StopStreetView
extends React.Component<StopStreetViewProps, void> {
  getFallbackURL(): string {
    let locationQuery: string;
    if (this.props.stop_lat && this.props.stop_lon) {
      locationQuery = `${this.props.stop_lat},${this.props.stop_lon}`;
    } else if (this.props.address) {
      locationQuery = this.props.address;
    } else {
      throw new Error('Must specify a location for StopStreetView');
    }

    return 'https://maps.googleapis.com/maps/api/streetview'
      + `?location=${locationQuery}`
      + `&size=${this.props.width}x${this.props.height}`
      + `&key=${this.props.apiKey}`;
  }

  render() {
    return (
      <div className="stop-street-view">
        <img
          className="street-view-fallback"
          alt=""
          src={this.getFallbackURL()}
          width={this.props.width}
          height={this.props.height}
        />
      </div>
    );
  }
}
