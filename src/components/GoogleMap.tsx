import { createElement, Component } from 'react';

interface GoogleMapProps {
	selected: string[],
	userPos: {
		lat: number,
		lng: number
	} | null
}

export default class GoogleMap extends Component<GoogleMapProps, void> {
	displayMarkers(geojson: GeoJSON.FeatureCollection<GeoJSON.Point>) {

	}
}
