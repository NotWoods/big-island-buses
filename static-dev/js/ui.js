var normal = {
	url: "assets/pins.png",
	size: {height: 26, width: 24},
	scaledSize: {height: 26, width: 120},
	origin: {x: 0, y: 0},
	anchor: {x: 12, y: 12}
}, unimportant = {
	url: "assets/pins.png",
	size: {height: 26, width: 24},
	scaledSize: {height: 26, width: 120},
	origin: {x: 96, y: 0},
	anchor: {x: 12, y: 12}
}, userShape = {
	url: "assets/pins.png",
	size: {height: 26, width: 24},
	scaledSize: {height: 26, width: 120},
	origin: {x: 48, y: 0},
	anchor: {x: 12, y: 12}
}, placeShape = {
	url: "assets/pins.png",
	size: {height: 26, width: 24},
	scaledSize: {height: 26, width: 120},
	origin: {x: 72, y: 0},
	anchor: {x: 12, y: 23}
}, stopShape = {
	url: "assets/pins.png",
	size: {height: 26, width: 24},
	scaledSize: {height: 26, width: 120},
	origin: {x: 24, y: 0},
	anchor: {x: 12, y: 20}
}, stopBound;

var worker = new Worker('/api-worker.js');
worker.addEventListener("message", function(e) {
	switch (e.data.type) {
		case "stops_list": addMarker(e.data.data); break;
		case "stops_list_complete": markersDone(); break;
		case "locate_stop": locationFound(e.data.data); break;
		case "stops": displayStop(e.data); break;
		case "routes": displayRoute(e.data); break;
		case "trips": displayTrip(e.data); break;
		case "shapes": displayShape(e.data);
	}
}, false);

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js').then(function(registration) {});
}

function newState(newState, action) {
	var url = ["/s/"];

	if (newState.route) {
		url.push(newState.route);
		if (newState.trip) {
			url.push("/", newState.trip);
		}
	}
	if (newState.stop) {
		url.push("?stop=", newState.stop);
	}

	if (action == "update" && "history" in navigator) {
		history.replaceState(newState, "", url.join(""));
	} else if (action != "link" && 'history' in navigator) {
		history.pushState(newState, "", url.join(""));
	}
	return url.join("");
}

window.onpopstate(function(e) {
	if (e.state.route) {
		worker.postMessage({type: "routes", key: e.state.route});
		if (e.state.trip) {
			worker.postMessage({type: "trips", key: e.state.trip});
		}
	}
	if (e.state.stop) {
		worker.postMessage({type: "stops", key: e.state.stop});
	}
});

function loadMapScript() {
	//Doing it here so my own map script is ready first!
	var script = document.createElement("script");
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI&sensor=true&libraries=places&callback=initMap";
	document.body.appendChild(script);
}
(function() {
  document.ready = new Promise(function(resolve) {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      function onReady() {
        resolve();
        document.removeEventListener('DOMContentLoaded', onReady, true);
        window.removeEventListener('load', onReady, true);
      }
      document.addEventListener('DOMContentLoaded', onReady, true);
      window.addEventListener('load', onReady, true);
    }
  });
})();

var mapReady = new Promise(), map, panorama, searchInput, searchService, placeMarker, userMarker;

function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		backgroundColor: "#b3d1ff",
		center: {lat: 19.6, lng: 155.5},
		streetViewControl: false,
		//disableDefaultUI: true,
		zoom: 8
	});
	panorama = new google.maps.StreetViewPanorama(document.getElementById("stop_image"), {
		visible: false,
		position: {lat: 19.6, lng: 155.5}
	});
	map.setStreetView(panorama);
	stopBound = new google.maps.LatLngBounds();
	searchService = new google.maps.places.AutocompleteService();
	mapReady.resolve();
}

var allMarkers = {};
function markerClicked() {
	if (this.type == "stop") {
		worker.postMessage({type: "stops", key: this.stop_id})
	} else if (this.type == "place") {
		worker.postMessage({
			type: "locate_stop",
			location: {
				lat: pos.coords.latitude,
				lng: pos.coords.longitude
			}
		});
	}
}
function addMarker(stopData) {
	var marker = new google.maps.Marker({
		position: {lat: stopData.stop_lat, lng: stopData.stop_lon},
		title: stopData.stop_name,
		map: map,
		icon: normal
	});
	marker.type = "stop";
	marker.stop_id = stopData.stop_id;
	stopBound.extend(marker.position);
	google.maps.event.addListener(marker, "click", markerClicked);
	allMarkers[stopData.stop_id] = marker;
}
function markersDone() {
	map.setCenter(boundsAllStops.getCenter());
	map.fitBounds(boundsAllStops);
}

var activeIcon;
function displayStop(stopData) {
	var stopNameDiv = document.getElementById("stop_name"),
		pinpoint = document.getElementById("pin_drop");
	stopNameDiv.textContent = stopData.name;
	if (stopData.color) {
		stopNameDiv.setAttribute("style", "background-color:#"+stopData.color+";color:#"+stopData.text_color)
	}
	pinpoint.setAttribute("data-stop-lat", stopInfo.location.lat);
	pinpoint.setAttribute("data-stop-lng", stopInfo.location.lng);
	mapReady.then(function() {
		panorama.setPosition(stopData.location);
		panorama.setPov(panorama.getPhotographerPov());
		if (panorama.getVisible() == false) panorama.setVisible(true);
	})

	//if (activeIcon) activeIcon.setIcon(normal);
	//activeIcon = allMarkers[stopData._id]
	//activeIcon.setIcon(stopShape);
}

var toolbar = document.getElementById("toolbar");
var saveButton = document.getElementById("save");
function displayRoute(routeData) {
	var header = document.getElementById("route_name");

	document.title = routeData.name;
	header.textContent = routeData.name;

	toolbar.setAttribute("style", "background-color:#"+routeData.color+";color:#"+routeData.text_color)
	if (routeData.text_color == "000000") toolbar.style.fill = "rgba(0,0,0,0.54)";

	if (localStorage.getItem('saved') && localStorage.getItem('saved').indexOf(routeData._id) > -1) {
		saveButton.className = "selected";
	}
	saveButton.setAttribute("data-currentRoute", routeData._id);

	var dir0 = document.createDocumentFragment(), dir1 = document.createDocumentFragment();
	for (var i = 0; i < routeData.trips.length; i++) {
		var tripItem = routeData.trips[i];
		var tripLink = document.createElement("a");
		tripLink.setAttribute("data-trip-id", tripItem._id);
		tripLink.textContent = tripItem.name;
		tripLink.href = "/s/"+routeData._id+"/"+tripItem._id+"/";
		if (tripItem.direction_id == 1) {
			dir1.appendChild(tripLink);
		} else {
			dir0.appendChild(tripLink);
		}
	};
	var dir0Div = document.getElementById("direction_0"), dir1Div = document.getElementById("direction_1");
	while (dir0Div.firstChild) {dir0Div.removeChild(dir0Div.firstChild)}
	while (dir1Div.firstChild) {dir1Div.removeChild(dir1Div.firstChild)}
	dir0Div.appendChild(dir0);
	dir1Div.appendChild(dir1);

	document.getElementById("next_stop_progress").style.backgroundColor = "#"+routeData.color;
}

function displayTrip(tripData) {
	var tripSelected = document.getElementById("trip_select_selected"),
		tripItems = document.querySelector(".trip_select_item a"),
		scheduleDiv = document.getElementById("schedule_items"),
		routeName = document.getElementById("save").getAttribute("data-currentRoute"),
		routeColor = document.getElementById("toolbar").style.backgroundColor,
		sch = tripData.schedule;

	for (var i = 0; i < tripItems.length; i++) {
		if (tripItems[i].getAttribute("data-trip-id") == tripData._id) {
			tripItems[i].className = "selected";
			break;
		}
	};

	tripSelected.setAttribute("data-trip-id", tripData._id);
	tripSelected.textContent = tripData.name;

	if (scheduleDiv.firstChild) {
		var scheduleItems = document.querySelector("#schedule_items a"), 
			foundIndexes = [];
		for (var j = 0; j < scheduleItems.length; j++) {
			var index = sch.indexOf(scheduleItems[j].getAttribute("data-stop-id"));
			if (index > -1 && foundIndexes.indexOf(index) == -1) {
				foundIndexes[j] = index;
			} else {
				scheduleDiv.removeChild(scheduleItems[j]);
			}
		}

		var scheduleItemFragment = document.createDocumentFragment();
		for (var k = 0; k < sch.length; k++) {
			var idx = foundIndexes.indexOf(k);
			if (idx > -1 && foundIndexes.length > 0) {
				var scheduleItem = scheduleItems[idx];
				scheduleDiv.removeChild(scheduleItem);
				scheduleDiv.href = "/s/"+routeName+"/"+tripData._id+"/?stop="+scheduleItems[j].stop_id;
				scheduleDiv.getElementsByClassName("arrival_time")[0].textContent = scheduleData.time;

				scheduleItemFragment.appendChild(scheduleItem);
			} else {
				var scheduleItem = document.createElement("a"), 
					marks = document.createElement("div"),
					line = document.createElement("div"),
					bullet = document.createElement("div"),
					stopName = document.createElement("span"),
					time = document.createElement("time");
				scheduleItem.href = "/s/"+routeName+"/"+tripData._id+"/?stop="+scheduleData.stop_id;
				scheduleItem.setAttribute("data-stop-id", scheduleData.stop_id);
				marks.className = "marks"; line.className = "line"; bullet.className = "bullet";
				line.style.backgroundColor = routeColor;
				stopName.className = "stop_name"; stopName.textContent = scheduleData.stop_name;
				time.className = "arrival_time"; time.textContent = scheduleData.time;
		
				marks.appendChild(line); marks.appendChild(bullet);
				scheduleItem.appendChild(marks); scheduleItem.appendChild(stopName); scheduleItem.appendChild(time);
		
				scheduleItemFragment.appendChild(scheduleItem);
			}
		}

		while(scheduleDiv.firstChild) {scheduleDiv.removeChild(scheduleDiv.firstChild)}
		scheduleDiv.appendChild(scheduleItemFragment);
	} else {
		var scheduleItems = document.createDocumentFragment();
		for (var j = 0; j < sch.length; j++) {
			var scheduleData = sch[j];

			var scheduleItem = document.createElement("a"), 
				marks = document.createElement("div"),
				line = document.createElement("div"),
				bullet = document.createElement("div"),
				stopName = document.createElement("span"),
				time = document.createElement("time");
			scheduleItem.href = "/s/"+routeName+"/"+tripData._id+"/?stop="+scheduleData.stop_id;
			scheduleItem.setAttribute("data-stop-id", scheduleData.stop_id);
			marks.className = "marks"; line.className = "line"; bullet.className = "bullet";
			line.style.backgroundColor = routeColor;
			stopName.className = "stop_name"; stopName.textContent = scheduleData.stop_name;
			time.className = "arrival_time"; time.textContent = scheduleData.time;

			marks.appendChild(line); marks.appendChild(bullet);
			scheduleItem.appendChild(marks); scheduleItem.appendChild(stopName); scheduleItem.appendChild(time);

			scheduleItems.appendChild(scheduleItem);
		}
	}

	var tripBounds = new google.maps.LatLngBounds();
	for (var b = 0; b < sch.length; b++) {
		tripBounds.extend(allMarkers[sch[b].stop_id].getPosition());
	}
	map.panTo(tripBounds.getCenter());
	map.fitBounds(tripBounds);

	worker.postMessage({type: "shapes", key: tripData.shape_id});
}

var shapePoly;
function displayShape(shapeData) {
	if (shapePoly) {
		shapePoly.strokeColor = toolbar.style.backgroundColor;
		shapePoly.setPath(shapeData);
	} else {
		shapePoly = new google.maps.Polyline({
			strokeColor: toolbar.style.backgroundColor,
			strokeOpacity: 1.0,
			strokeWeight: 3,
			map: map,
			path: shapeData
		});
	}
}

function findLocation() {
	navigator.geolocation.getCurrentPosition(function(pos) {
		var locationButton = document.getElementById("location");
		locationButton.className = "selected";

		if (!userMarker) {
			userMarker = new google.maps.Marker({
				position: {lat: pos.coords.latitude, lng: pos.coords.longitude},
				title: "My location",
				map: map,
				icon: userShape
			});
			userMarker.type = "place";
			google.maps.event.addListener(userMarker, "click", markerClicked);
		} else {
			userMarker.setPosition({lat: pos.coords.latitude, 
				lng: pos.coords.longitude});
		}
		userMarker.setAnimation(google.maps.Animation.DROP);

		worker.postMessage({
			type: "locate_stop",
			sensor: true,
			location: {
				lat: pos.coords.latitude,
				lng: pos.coords.longitude
			}
		});
	})
}
function locationFound(stop) {
	displayStop(stop);
}

searchInput.oninput = function(e) {
	searchService.getQueryPredictions({
		input: searchInput.value,
		location: {lat: 19.6, lng: 155.5},
		radius: 110 
	}, search);
}
function search(predictions, status) {
	if (status != google.maps.places.PlacesServiceStatus.OK) {}

	var searchResults = document.getElementById("place_results");
	if (searchResults.firstChild) {searchResults.removeChild(searchResults.firstChild)}

	var searchFragment = document.createDocumentFragment();
	for (var i = 0; i < predictions.length; i++) {
		var result = document.createElement("li"),
			resultIcon = document.createElement("svg"),
			resultPath = document.createElement("path"),
			resultName = document.createElement("span");

		result.className = "result_item";
		result.setAttribute("data-stop-lat", )
		result.setAttribute("data-stop-lng", )

		resultIcon.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", "0 0 24 24");
		resultIcon.setAttributeNS("http://www.w3.org/2000/svg", "height", "24");
		resultIcon.setAttributeNS("http://www.w3.org/2000/svg", "width", "24");
		resultPath.setAttributeNS("http://www.w3.org/2000/svg", "d", "M12 2C8.13 2 5 5.13 " + 
			"5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38" +
			"0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z");

		resultName.textContent = predictions[i].description;
	};
}

document.getElementById("location").addEventListener("click", findLocation);


document.getElementById("close_search").addEventListener("click", function(e) {});

saveButton.addEventListener("click", function(e) {
	var savedItems = localStorage.getItem('saved'), saveStatus = saveButton.className, 
		currentRoute = saveButton.getAttribute("data-currentRoute"), 
		saveIndex = savedItems.indexOf(currentRoute);
	if (saveStatus == "selected") {
		if (saveIndex > -1) savedItems.splice(index, 1);
		saveStatus = "";
		localStorage.setItem("saved", savedItems);
	} else {
		saveStatus = "selected";
		var saveIndex = savedItems.indexOf(currentRoute);
		if (saveIndex == -1) savedItems.push(currentRoute);
		localStorage.setItem("saved", savedItems);
	}
	e.stopPropagation();
});

document.getElementById("route-select").addEventListener("click", function(e) {
	if (e.target && e.target.className == "route_item") {
		var updatedState = {route: e.target.getAttribute("data-route-id")};
		newState(updatedState);
		worker.pushMessage({type: "routes", key: updatedState.route})
		e.preventDefault();
	}
	e.stopPropagation();
});

document.getElementById("trip_select_options").addEventListener("click", function(e) {
	if (e.target && e.target.className == "trip_select_item") {
		var thisTrip = e.target.getAttribute("data-stop-id");
		newState({route: saveButton.getAttribute("data-currentRoute"), trip: thisTrip});
		worker.pushMessage({type: "trips", key: thisTrip});
		e.preventDefault();
	}
	e.stopPropagation();
});

document.getElementById("locations").addEventListener("click", function(e) {
	if (e.target && (e.target.id == "location_start" || e.target.id == "location_end")) {
		var thisStop = e.target.getAttribute("data-stop-id");
		newState({stop: thisStop});
		worker.pushMessage({type: "stops", key: thisStop});
		e.preventDefault();
	} 
	e.stopPropagation();
});

document.getElementById("next_stop_name").addEventListener("click", function(e) {
	var thisStop = e.target.getAttribute("data-stop-id");
	newState({stop: thisStop});
	worker.pushMessage({type: "stops", key: thisStop});
	e.preventDefault();
	e.stopPropagation();
});

document.getElementById("schedule_items").addEventListener("click", function(e) {
	if (e.target && e.target.nodeName == "A") {
		var thisStop = e.target.getAttribute("data-stop-id");
		newState({stop: thisStop});
		worker.pushMessage({type: "stops", key: thisStop});
		e.preventDefault();
	}
	e.stopPropagation();
});

var pinDrop = document.getElementById("pin_drop");
pinDrop.addEventListener("click", function(e) {
	map.panTo({
		lat: pinDrop.getAttribute("data-stop-lat"),
		lng:pinDrop.getAttribute("data-stop-lon")
	});
	e.stopPropagation();
});

document.getElementById("connection_list").addEventListener("click", function(e) {
	if (e.target && e.target.className == "route_item") {
		var updatedState = {route: e.target.getAttribute("data-route-id")};
		newState(updatedState);
		worker.pushMessage({type: "routes", key: updatedState.route})
		e.preventDefault();
	}
	e.stopPropagation();
});