import { Stop } from '../../gtfs-types';

let streetview: google.maps.StreetViewPanorama | undefined;

function stopToPos(stop: Stop) {
    return new google.maps.LatLng(
        parseFloat(stop.stop_lat),
        parseFloat(stop.stop_lon),
    );
}

export function loadStreetView() {
    const panoElement = document.getElementById('streetview-canvas')!;

    streetview = new google.maps.StreetViewPanorama(panoElement, {
        position: new google.maps.LatLng(19.723835, -155.084741),
        visible: true,
        pov: { heading: 34, pitch: 0 },
        scrollwheel: false,
        panControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        addressControl: false,
    });

    google.maps.event.trigger(streetview, 'resize');
    window.addEventListener('resize', () => {
        google.maps.event.trigger(streetview, 'resize');
    });

    return streetview;
}

export function showTrip() {
    google.maps.event.trigger(streetview, 'resize');
}

export function showStop(stop: Stop, stopMarker?: google.maps.Marker) {
    const address = document.getElementById('address')!;
    if (streetview) {
        streetview.setPosition(
            (stopMarker && stopMarker.getPosition()) || stopToPos(stop),
        );

        google.maps.event.trigger(streetview, 'resize');
        google.maps.event.addListener(streetview, 'pano_changed', () => {
            address.textContent = streetview!.getLocation().description!;
            streetview!.setPov(streetview!.getPhotographerPov());
        });
    } else {
        document.getElementById('stop')!.classList.add('no-streetview');
    }
}
