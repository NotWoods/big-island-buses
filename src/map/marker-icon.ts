export const Icon = {
    STOP: {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 0, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    STOP_OUTSIDE_ROUTE: {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 96, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    USER_LOCATION: {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 48, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    SEARCH_RESULT: {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 72, y: 0 },
        anchor: { x: 12, y: 23 },
    } as google.maps.Icon,
    SELECTED_STOP: {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 24, y: 0 },
        anchor: { x: 12, y: 20 },
    } as google.maps.Icon,
};

export const ZIndex = {
    STOP: 200,
    STOP_OUTSIDE_ROUTE: 0,
    USER_LOCATION: 1000,
    SEARCH_RESULT: 900,
    SELECTED_STOP: 1000,
};
