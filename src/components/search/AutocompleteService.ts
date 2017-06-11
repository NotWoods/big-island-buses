const { PlacesServiceStatus } = google.maps.places;

export function getPlacePredictions(
  service: google.maps.places.AutocompleteService,
  request: google.maps.places.AutocompletionRequest
): Promise<google.maps.places.AutocompletePrediction[]> {
  return new Promise((resolve, reject) => {
    service.getPlacePredictions(request, (result, status) => {
      switch (status) {
        case PlacesServiceStatus.OK:
          resolve(result);
          break;
        case PlacesServiceStatus.ZERO_RESULTS:
          resolve([]);
          break;
        default:
          reject(status);
          break;
      }
    });
  });
}

export function getQueryPredictions(
  service: google.maps.places.AutocompleteService,
  request: google.maps.places.QueryAutocompletionRequest
): Promise<google.maps.places.QueryAutocompletePrediction[]> {
  return new Promise((resolve, reject) => {
    service.getQueryPredictions(request, (result, status) => {
      switch (status) {
        case PlacesServiceStatus.OK:
          resolve(result);
          break;
        case PlacesServiceStatus.ZERO_RESULTS:
          resolve([]);
          break;
        default:
          reject(status);
          break;
      }
    });
  });
}
