import { Component, ComponentChild, h } from 'preact';
import { convertLatLng } from 'spherical-geometry-js';
import { loadGoogleMaps } from './load';
import { AfterTimeout } from './AfterTimeout';
import { API_KEY } from '../../config';

const StaticStreetView = (props: {
    height: number;
    width: number;
    lat: number;
    lon: number;
}) => {
    const args = new URLSearchParams({
        key: API_KEY,
        location: `${props.lat},${props.lon}`,
        size: `${props.width}x${props.height}`,
    });
    const src = `https://maps.googleapis.com/maps/api/streetview?${args.toString()}`;
    return (
        <img
            class="stop__streetview-canvas-static"
            height={props.height}
            width={props.width}
            src={src}
            alt="Street view of bus stop"
        />
    );
};

interface Props {
    lat: number;
    lon: number;
}

interface State {
    loaded: boolean;
}

export class GoogleStreetView extends Component<Props, State> {
    streetView?: google.maps.StreetViewPanorama;
    streetViewEl?: HTMLDivElement;

    async componentDidMount() {
        const { StreetViewPanorama } = await loadGoogleMaps();
        this.streetView = new StreetViewPanorama(this.streetViewEl!, {
            position: convertLatLng(this.props).toJSON(),
            visible: true,
            scrollwheel: false,
            addressControl: false,
            fullscreenControl: false,
            motionTracking: false,
        });

        this.setState({ loaded: true });
    }

    componentDidUpdate(prevProps: Props) {
        if (
            this.props.lat !== prevProps.lat ||
            this.props.lon !== prevProps.lon
        ) {
            this.streetView!.setPosition(convertLatLng(this.props).toJSON());
        }
    }

    render({ lat, lon }: Props, { loaded }: State) {
        let staticImg: ComponentChild = null;
        if (!loaded) {
            staticImg = (
                <AfterTimeout ms={1000}>
                    <StaticStreetView
                        height={283}
                        width={426}
                        lat={lat}
                        lon={lon}
                    />
                </AfterTimeout>
            );
        }

        return (
            <div id="map-canvas" class="map__canvas">
                {staticImg}
                <div class="canvas" ref={el => (this.streetViewEl = el)} />
            </div>
        );
    }
}
