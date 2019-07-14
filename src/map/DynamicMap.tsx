import { Component, h } from 'preact';
import {
    convertLatLng,
    LatLngBoundsLiteral,
    LatLngLike,
} from 'spherical-geometry-js';
import { Stop } from '../common/api-types';
import { loadGoogleMaps } from './load-maps-api';
import { Icon, ZIndex } from './marker-icon';

interface Props {
    bounds?: LatLngBoundsLiteral;
    stop_id?: string;
    stops?: Map<Stop['stop_id'], Stop>;
    highlighted?: Set<Stop['stop_id']>;
    userPosition?: {
        coords: LatLngLike;
        stop_id: string;
    };
    places?: Iterable<LatLngLike>;
    onOpenStop?(stop_id: string): void;
}

interface State {
    mounted?: boolean;
}

export class GoogleMap extends Component<Props, State> {
    map?: google.maps.Map;
    mapEl?: HTMLDivElement;

    markers = new Map<string, google.maps.Marker>();
    userPositionMarker?: google.maps.Marker;
    places: google.maps.Marker[] = [];
    stopMarkerData = new WeakMap<google.maps.Marker, string>();

    handleMarkerClick: (this: google.maps.Marker) => void;

    constructor(props: Props) {
        super(props);
        const onMarkerClick = (marker: google.maps.Marker) => {
            const stop_id = this.stopMarkerData.get(marker);
            if (stop_id && this.props.onOpenStop) {
                this.props.onOpenStop(stop_id);
            }
        };
        this.handleMarkerClick = function() {
            onMarkerClick(this);
        };
    }

    async componentDidMount() {
        const { Map, ControlPosition } = await loadGoogleMaps();
        this.map = new Map(this.mapEl || null, {
            center: { lat: 19.6, lng: -155.56 },
            zoom: 10,
            backgroundColor: '#aadaff',
            mapTypeControlOptions: {
                position: ControlPosition.BOTTOM_RIGHT,
            },
            fullscreenControlOptions: {
                position: ControlPosition.RIGHT_BOTTOM,
            },
            streetViewControl: false,
        });

        this.fitBounds();
        this.createStopMarkers(new Set());
        this.createUserLocationMarker();
        this.createPlaceMarkers();
        this.updateSelectedMarker(undefined);
        this.setState({ mounted: true });
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.state.mounted) return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (this.props.bounds !== prevProps.bounds) {
                    this.fitBounds();
                }
                if (
                    this.props.stops !== prevProps.stops ||
                    this.props.highlighted !== prevProps.highlighted
                ) {
                    this.createStopMarkers(prevProps.highlighted || new Set());
                }
                if (this.props.userPosition !== prevProps.userPosition) {
                    this.createUserLocationMarker();
                }
                if (this.props.places !== prevProps.places) {
                    this.createPlaceMarkers();
                }
                if (this.props.stop_id !== prevProps.stop_id) {
                    this.updateSelectedMarker(prevProps.stop_id);
                }
            });
        });
    }

    fitBounds() {
        if (this.props.bounds) this.map!.fitBounds(this.props.bounds);
    }

    createStopMarkers(lastHighlighted: Set<Stop['stop_id']>) {
        if (!this.props.stops) return;
        const { highlighted = new Set<Stop['stop_id']>() } = this.props;

        for (const stop of this.props.stops.values()) {
            let marker = this.markers.get(stop.stop_id);
            if (!marker) {
                marker = new google.maps.Marker({
                    position: convertLatLng(stop).toJSON(),
                    title: stop.name,
                    icon: Icon.STOP,
                    map: this.map,
                    zIndex: ZIndex.STOP_OUTSIDE_ROUTE,
                });
                this.stopMarkerData.set(marker, stop.stop_id);
                google.maps.event.addListener(
                    marker,
                    'click',
                    this.handleMarkerClick,
                );
                this.markers.set(stop.stop_id, marker);
            }

            if (highlighted.has(stop.stop_id) || highlighted.size === 0) {
                marker.setIcon(Icon.STOP);
                marker.setZIndex(ZIndex.STOP);
            } else if (
                lastHighlighted.has(stop.stop_id) ||
                lastHighlighted.size === 0
            ) {
                marker.setIcon(Icon.STOP_OUTSIDE_ROUTE);
                marker.setZIndex(0);
            }
        }
    }

    createUserLocationMarker() {
        if (this.props.userPosition) {
            const position = convertLatLng(
                this.props.userPosition.coords,
            ).toJSON();
            if (!this.userPositionMarker) {
                this.userPositionMarker = new google.maps.Marker({
                    position,
                    title: 'My Location',
                    icon: Icon.USER_LOCATION,
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    zIndex: ZIndex.USER_LOCATION,
                });
            } else {
                this.userPositionMarker.setPosition(position);
                this.userPositionMarker.setMap(this.map!);
            }
            this.stopMarkerData.set(
                this.userPositionMarker,
                this.props.userPosition.stop_id,
            );
        } else if (this.userPositionMarker) {
            this.userPositionMarker.setMap(null);
        }
    }

    createPlaceMarkers() {
        const places = this.props.places || [];
        let i = 0;
        for (const place of places) {
            const marker = this.places[i];
            const position = convertLatLng(place).toJSON();
            if (!marker) {
                this.places[i] = new google.maps.Marker({
                    position,
                    title: 'Search Location',
                    icon: Icon.SEARCH_RESULT,
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    zIndex: ZIndex.SEARCH_RESULT,
                });
            } else {
                marker.setPosition(position);
                marker.setMap(this.map!);
            }
            i++;
        }
        // Hide excess place markers
        for (; i < this.places.length; i++) {
            this.places[i].setMap(null);
        }
    }

    updateSelectedMarker(prevId: string | null | undefined) {
        const marker = this.markers.get(this.props.stop_id!);
        const prevMarker = this.markers.get(prevId!);
        if (prevMarker) {
            const icon =
                !this.props.highlighted || this.props.highlighted.has(prevId!)
                    ? 'STOP'
                    : 'STOP_OUTSIDE_ROUTE';
            prevMarker.setIcon(Icon[icon]);
            prevMarker.setZIndex(ZIndex[icon]);
        }
        if (marker) {
            marker.setIcon(Icon.SELECTED_STOP);
            marker.setZIndex(ZIndex.SELECTED_STOP);
        }
    }

    render() {
        return <div class="canvas" ref={el => (this.mapEl = el)} />;
    }
}
