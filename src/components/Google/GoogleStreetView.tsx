import { Component, ComponentChild, h } from 'preact';
import { convertLatLng } from 'spherical-geometry-js';

const StaticStreetView = (props: {
    height: number;
    width: number;
    lat: number;
    lon: number;
}) => {
    const args = new URLSearchParams({
        key: 'AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI',
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
        await import('googlemaps' as string);
        this.streetView = new google.maps.StreetViewPanorama(
            this.streetViewEl!,
            {
                position: convertLatLng(this.props),
                visible: true,
                pov: { heading: 34, pitch: 0 },
                scrollwheel: false,
                addressControl: false,
            },
        );

        this.setState({ loaded: true });
        window.addEventListener('resize', () => {
            google.maps.event.trigger(this.streetView, 'resize');
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (
            this.props.lat !== prevProps.lat ||
            this.props.lon !== prevProps.lon
        ) {
            this.streetView!.setPosition(convertLatLng(this.props));
        }
    }

    render({ lat, lon }: Props, { loaded }: State) {
        let staticImg: ComponentChild = null;
        if (!loaded) {
            staticImg = (
                <StaticStreetView
                    height={283}
                    width={426}
                    lat={lat}
                    lon={lon}
                />
            );
        }

        return (
            <div id="map-canvas" class="map__canvas">
                {staticImg}
                <div ref={el => (this.streetViewEl = el)} />
            </div>
        );
    }
}
