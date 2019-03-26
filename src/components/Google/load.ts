const CALLBACK_NAME = '__googleMapsApiOnLoadCallback';

declare global {
    interface Window {
        __googleMapsApiOnLoadCallback?: () => void;
    }
}

let promise: Promise<typeof google.maps>;

interface GoogleMapsLoadOptions {
    key: string;
    libraries: string;
}

export function loadGoogleMaps(options: GoogleMapsLoadOptions) {
    if (!promise) {
        promise = new Promise((resolve, reject) => {
            // Hook up the on load callback
            window[CALLBACK_NAME] = () => {
                resolve(google.maps);
                delete window[CALLBACK_NAME];
            };

            const params = new URLSearchParams({
                ...options,
                callback: CALLBACK_NAME,
            });

            // Prepare the `script` tag to be inserted into the page
            const scriptElement = document.createElement('script');
            scriptElement.src = `https://maps.googleapis.com/maps/api/js?${params}`;
            scriptElement.onerror = reject;
            document.body.appendChild(scriptElement);
        });
    }

    return promise;
}
