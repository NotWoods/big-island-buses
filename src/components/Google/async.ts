export async function geocode(
    geocoder: google.maps.Geocoder,
    request: google.maps.GeocoderRequest,
): Promise<google.maps.GeocoderResult[]> {
    return new Promise((resolve, reject) => {
        geocoder.geocode(request, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                resolve(results);
            } else {
                reject(new Error(String(status)));
            }
        });
    });
}

export async function getQueryPredictions(
    service: google.maps.places.AutocompleteService,
    request: google.maps.places.QueryAutocompletionRequest,
): Promise<google.maps.places.QueryAutocompletePrediction[]> {
    return new Promise((resolve, reject) => {
        service.getQueryPredictions(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                reject(new Error(String(status)));
            }
        });
    });
}
