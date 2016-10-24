/**
 * Contains code to build UI. Interacts with DOM.
 * @author       Tiger Oakes <tigeroakes@gmail.com>
 * @copyright    2014 Tiger Oakes
 */

var buses = {};
var documentPromise = documentLoad();
var schedulePromise = getScheduleData("gtfs", "buses");
schedulePromise.then(function(r) {buses = r;});
var locatePromise = locateUser(schedulePromise), placeMapMarker;
var mapLoaded = loadMap();
if (mapLoaded === false) {locatePromise.then(function(position) {if (!Active.STOP) openStop(position.stop);});}

function loadMap() {
	if (!navigator.onLine || typeof google !== "object" || typeof google.maps !== "object") {
		console.error("Google Maps API has not loaded");
		documentPromise.then(function() {document.body.classList.add("no-map")});
		return false;
	}
	boundsAllStops = new google.maps.LatLngBounds();
	markers = []; var loadedMarkers = false, loadedMap = false;

	function markersAndLatLng(schedule) {
		return new Promise(function(markersDone, markerErr) {
			for (var k in schedule.stops) {
				var myLatLng = new google.maps.LatLng(schedule.stops[k].stop_lat, schedule.stops[k].stop_lon);
				var marker = new google.maps.Marker({
					position: myLatLng,
					title: schedule.stops[k].stop_name,
					icon: normal
				});
				marker.Type = Type.STOP;
				marker.Value = schedule.stops[k].stop_id;
				marker.stop_id = schedule.stops[k].stop_id;
				google.maps.event.addListener(marker, "click", clickEvent);
				boundsAllStops.extend(marker.position);
				markers.push(marker);
			}
			markersDone({markers: markers, bounds: boundsAllStops});
		});
	}

	function mapLoad() {
		return new Promise(function(mapDone, mapErr) {
			var mapElement = Active.View.STOP == View.MAP_PRIMARY ?
				document.getElementById("map-canvas") : document.getElementById("streetview-canvas"),
			panoElement = Active.View.STOP == View.STREET_PRIMARY ?
				document.getElementById("map-canvas") : document.getElementById("streetview-canvas"),
			hawaiiCenter = new google.maps.LatLng(19.6, -155.56);

			map = new google.maps.Map(mapElement, {
				center: new google.maps.LatLng(19.6, -155.56),
				zoom: 10,
				mapTypeControlOptions: {position: google.maps.ControlPosition.TOP_CENTER},
   			panControlOptions: {position: google.maps.ControlPosition.RIGHT_TOP},
   			streetViewControlOptions: {position: google.maps.ControlPosition.RIGHT_TOP},
   			zoomControlOptions: {position: google.maps.ControlPosition.RIGHT_TOP}
			});

			streetview = new google.maps.StreetViewPanorama(panoElement, {
				position: new google.maps.LatLng(19.723835,-155.084741),
				visible: true,
				pov: {heading: 34, pitch: 0},
				scrollwheel: false,
				panControlOptions: {position: google.maps.ControlPosition.RIGHT_CENTER},
				zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL,
					position: google.maps.ControlPosition.RIGHT_CENTER},
  			addressControl: false
			});
			map.setStreetView(streetview);

			autocomplete = new google.maps.places.Autocomplete(document.getElementById("search"));
			autocomplete.bindTo('bounds', map);
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				loc = autocomplete.getPlace().geometry.location;
				console.log("Lat %s, Lon %s", loc.lat(), loc.lng());
				locateUser(schedulePromise, {latitude: loc.lat(), longitude: loc.lng()}).then(function(position) {
					if (!placeMapMarker) {
						placeMapMarker = new google.maps.Marker({
							position: new google.maps.LatLng(position.location.latitude, position.location.longitude),
							title: "Search Location",
							icon: placeShape,
							map: map,
							animation: google.maps.Animation.DROP,
							zIndex:1000
						});
						placeMapMarker.Type = Type.STOP;
						google.maps.event.addListener(placeMapMarker, "click", clickEvent);
					}
					placeMapMarker.Value = position.stop;
					openStop(position.stop);
				});
			});
			mapDone(map);
		});
	}

	mapPromises = [documentPromise.then(mapLoad), schedulePromise.then(markersAndLatLng)];
	Promise.all(mapPromises).then(function(results) {
		var map = results[0], markers = results[1].markers, boundsAllStops = results[1].bounds;
		map.setCenter(boundsAllStops.getCenter());
		map.fitBounds(boundsAllStops);
		google.maps.event.addListener(map, "bounds_changed", function() {
			var mapBounds = map.getBounds();
			for (var h = 0; h < markers.length; h++) {
				var m = markers[h];
				if (mapBounds.contains(m.getPosition())) {
					if (m.getMap() != map) m.setMap(map);
				} else {
					m.setMap(null);
				}
			}
		});
		for (var i = 0; i < markers.length; i++) markers[i].setMap(map);
		locatePromise.then(function(position) {
			userMapMarker = new google.maps.Marker({
				position: new google.maps.LatLng(position.location.latitude, position.location.longitude),
				title: position.custom?"Location of Place":"My Location",
				icon: position.custom?placeShape:userShape,
				map: map,
				animation: google.maps.Animation.DROP,
				zIndex: 1000
			});
			userMapMarker.Type = Type.STOP;
			userMapMarker.Value = position.stop;
			google.maps.event.addListener(userMapMarker, "click", clickEvent);
			if (!Active.STOP) openStop(position.stop);
			userMapMarker.addEventListener("locationupdate", function(e) {
				userMapMarker.setIcon(e.custom?placeShape:userShape);
				userMapMarker.setPosition(new google.maps.LatLng(e.location.latitude, e.location.longitude));
			});
		});
	});

	window.addEventListener("resize", function() {
		google.maps.event.trigger(map, "resize");
		google.maps.event.trigger(streetview, "resize");
		if (!Active.Route.ID) {
			map.setCenter(boundsAllStops.getCenter());
			map.fitBounds(boundsAllStops);
		}
	});
}

schedulePromise.then(updateAside);
function updateAside(schedule) {
	var aside, routeListItems = [];
	function generateListItems() {
		for (var item in schedule.routes) {
			var listItem = document.createElement("li");
			listItem.style.borderColor = "#"+schedule.routes[item].route_color;
			listItem.route_id = schedule.routes[item].route_id;
			var link = dynamicLinkNode(Type.ROUTE, schedule.routes[item].route_id, true);
			link.textContent = schedule.routes[item].route_long_name;
			listItem.appendChild(link);
			routeListItems.push(listItem);
		}
	}

	documentPromise.then(function() {
		if (aside !== null && typeof aside != "undefined") {
			insertListItems();
		} else {
			generateListItems();
			aside = document.getElementById("aside");
			aside.routeListItems = routeListItems;
			insertListItems();
		}
	});

	function insertListItems() {
		var nearbyList = document.getElementById("nearby"), otherList = document.getElementById("other");
		for (var j = 0; j < aside.routeListItems.length; j++) otherList.appendChild(aside.routeListItems[j]);
		locatePromise.then(function(result) {
			for (var i = 0; i < aside.routeListItems.length; i++) {
				if (schedule.stops[result.stop].routes.indexOf(aside.routeListItems[i].route_id) > -1) {
					nearbyList.appendChild(aside.routeListItems[i]);
				} else {
					otherList.appendChild(aside.routeListItems[i]);
				}
			}
		});
	}
}

documentPromise.then(function() {uiEvents();});

Promise.all([documentPromise, schedulePromise]).then(function(results) {
	if (!window.history.state && window.location.search.indexOf("#!") > -1) {
		Active.Route.ID = getQueryVariable("route") ? getQueryVariable("route") : Active.Route.ID;
		Active.Route.TRIP = getQueryVariable("trip") ? getQueryVariable("trip") : Active.Route.TRIP;
		Active.STOP = getQueryVariable("stop") ? getQueryVariable("stop") : Active.STOP;

		var bestTrip = openRoute(Active.Route.ID);
		console.log(Active);
		openStop(Active.STOP);
		openTrip(Active.Route.TRIP ? Active.Route.TRIP : bestTrip);
	} else if (window.history.state) {
		Active = window.history.state;
		var bestTripAlt = openRoute(Active.Route.ID);
		openStop(Active.STOP);
		openTrip(Active.Route.TRIP ? Active.Route.TRIP : bestTripAlt);
	}
});

window.onhashchange = function(e) {
	Active.Route.ID = getQueryVariable("route") ? getQueryVariable("route") : Active.Route.ID;
	Active.Route.TRIP = getQueryVariable("trip") ? getQueryVariable("trip") : Active.Route.TRIP;
	Active.STOP = getQueryVariable("stop") ? getQueryVariable("stop") : Active.STOP;
	var bestTrip = openRoute(Active.Route.ID);
	openStop(Active.STOP);
	openTrip(Active.Route.TRIP ? Active.Route.TRIP : bestTrip);
};
window.onpopstate = function(e) {
	Active = e.state;
	var bestTrip = openRoute(Active.Route.ID);
	openStop(Active.STOP);
	openTrip(Active.Route.TRIP ? Active.Route.TRIP : bestTrip);
}

/**
 * Adds click events to buttons in the site.
 */
function uiEvents() {
	if (!navigator.onLine) {document.getElementById("main").classList.add("offline");}
	document.getElementById("map-toggle").addEventListener("click", switchMapStreetview);
	var select = document.getElementById("trip-select");
	select.Type = Type.TRIP;
	select.addEventListener("change", function(e) {
		select.Value = select.options[select.selectedIndex].value;
		clickEvent.call(select, e);
	});
	document.getElementById("screen-cover").addEventListener("click", function() {
		document.getElementById("aside").classList.remove("open");
	});
	document.getElementById("menu").addEventListener("click", function() {
		document.getElementById("aside").classList.toggle("open");
	});
	document.getElementById("alt-menu").addEventListener("click", function() {
		document.getElementById("aside").classList.toggle("open");
	});
}

/**
 * Swaps map and streetview divs
 * @return {[type]} [description]
 */
function switchMapStreetview() {
	if (!map || !streetview) {
		console.error("Map and StreetViewPanorama have not loaded");
		//throw false;
		return;
	}

	var mapParent = document.getElementById("map");
	var panoParent = document.getElementById("streetview-header");

	if (Active.View.STOP == View.MAP_PRIMARY) {
		mapParent.insertBefore(document.getElementById("streetview-canvas"), mapParent.firstChild);
		panoParent.insertBefore(document.getElementById("map-canvas"), mapParent.firstChild);
		this.classList.add("on");
		Active.View.STOP = View.STREET_PRIMARY;
	} else if (Active.View.STOP == View.STREET_PRIMARY) {
		mapParent.insertBefore(document.getElementById("map-canvas"), mapParent.firstChild);
		panoParent.insertBefore(document.getElementById("streetview-canvas"), mapParent.firstChild);
		this.classList.remove("on");
		Active.View.STOP = View.MAP_PRIMARY;
	}
	dispatchEvent(updateEvent);
}

function switchTripView() {
	if (Active.View.ROUTE == View.LIST) {
		Active.View.ROUTE = View.TIMETABLE;
		this.classList.add("timetable");
		this.title = "View as list";
	} else if (Active.View.ROUTE == View.TIMETABLE) {
		Active.View.ROUTE = View.LIST;
		this.classList.remove("timetable");
		this.title = "View as timetable";
	}
	openTrip(Active.Route.TRIP);
}

/**
 * Creates a route UI and opens the section if the map is currently in fullscreen mode.
 * @param  {string} route_id ID of the route
 * @return {string}          trip_id that can be used in openTrip. Best matches time and open stop, if any.
 * @throws {string} If the ID does not exist
 */
function openRoute(route_id) {
	if (!buses.routes[route_id] || !buses.routes[route_id].route_id) {
		console.error("Invalid Route %s", route_id);
		//throw route_id;
		return;
	}

	var thisRoute = buses.routes[route_id];
	Active.Route.ID = route_id;
	Active.Route.TRIP = null;

	document.title = thisRoute.route_long_name;

	var content = document.getElementById("content");
	var name = document.getElementById("route_long_name");
	name.textContent = thisRoute.route_long_name;
	name.style.backgroundColor = "#" + thisRoute.route_color;
	name.style.color = "#" + thisRoute.route_text_color;
	document.getElementById("alt-menu").style.fill = "#" + thisRoute.route_text_color;

	var firstStop, lastStop, largest = 0;
	var earliest = new Date(0, 0, 0, 23, 59, 59, 0),
	latest = new Date(0, 0, 0, 0, 0, 0, 0), earliestTrip, earliestTripStop;

	var nowTime = nowDateTime();
	var closestTrip, closestTripTime = Number.MAX_VALUE, closestTripStop;
	var select = document.getElementById("trip-select");
	while (select.hasChildNodes()) {
    select.removeChild(select.lastChild);
	}

	var routeStops = [];

	for (var trip in thisRoute.trips) {
		for (var stop in thisRoute.trips[trip].stop_times) {
			if (stop == "1" && parseInt(thisRoute.trips[trip].direction_id,10) === 0) {
				firstStop = thisRoute.trips[trip].stop_times[stop].stop_id;
			} else {
				if (parseInt(stop, 10) > largest  && parseInt(thisRoute.trips[trip].direction_id,10) === 0) {
					largest = stop;
					lastStop = thisRoute.trips[trip].stop_times[stop].stop_id;
				}
			}

			if (routeStops.indexOf(thisRoute.trips[trip].stop_times[stop].stop_id) == -1) {
				routeStops.push(thisRoute.trips[trip].stop_times[stop].stop_id);
			}

			var timeDate = gtfsArrivalToDate(thisRoute.trips[trip].stop_times[stop].arrival_time);
			if (timeDate > latest) {
				latest = timeDate;
			}
			if (timeDate < earliest) {
				earliest = timeDate;
				earliestTrip = thisRoute.trips[trip].trip_id; earliestTripStop = thisRoute.trips[trip].stop_times[stop].stop_id;
			}

			if (timeDate - nowTime < closestTripTime && timeDate - nowTime > 0) {
				closestTripTime = timeDate - nowTime;
				closestTrip = thisRoute.trips[trip].trip_id; closestTripStop = thisRoute.trips[trip].stop_times[stop].stop_id;
			}
		}
		if (!closestTrip) { //Too late for all bus routes
			closestTripTime = new Date(0,0,1,earliest.getHours(),earliest.getMinutes(),earliest.getSeconds(),0) - nowTime;
			closestTrip = earliestTrip; closestTripStop = earliestTripStop;
		}
		var option = document.createElement("option");
		option.value = thisRoute.trips[trip].trip_id;
		option.textContent = thisRoute.trips[trip].trip_short_name;
		select.appendChild(option);
	}

	var minString = Math.floor(closestTripTime/60000) != 1 ? Math.floor(closestTripTime/60000) + " minutes" : "1 minute";
	document.getElementById("place-value").textContent = "Between " +
		buses.stops[firstStop].stop_name + " - " + buses.stops[lastStop].stop_name;
	document.getElementById("time-value").textContent = stringTime(earliest) + " - " + stringTime(latest);
	document.getElementById("next-stop-value").textContent = "Reaches " + buses.stops[closestTripStop].stop_name + " in " + minString;

	document.getElementById("main").classList.add("open");

	if (typeof google == "object" && typeof google.maps == "object") {
		var routeBounds = new google.maps.LatLngBounds();
		for (var k = 0; k < markers.length; k++) {
			if (routeStops.indexOf(markers[k].stop_id) > -1) {
				markers[k].setIcon(normal);
				markers[k].setZIndex(200);
				markers[k].activeInRoute = true;
				routeBounds.extend(markers[k].position);
			}	else {
				markers[k].setIcon(unimportant);
				markers[k].setZIndex(null);
				markers[k].activeInRoute = false;
			}
		}
		if (stopMarker) {
			stopMarker.setIcon(stopShape);
			stopMarker.setZIndex(300);
		}

		google.maps.event.trigger(map, "resize");
		map.setCenter(routeBounds.getCenter());
		map.fitBounds(routeBounds);
		google.maps.event.trigger(streetview, "resize");
	}


	this.dispatchEvent(updateEvent);
	openTrip(closestTrip);
	return closestTrip;
}

/**
 * Creates a Stop fragment in the #stop element
 * @param  {[type]} stop_id Id of the stop to use
 * @return {void}           Creates an element
 */
function openStop(stop_id) {
	if (!buses.stops[stop_id] || !buses.stops[stop_id].stop_id) {
		console.error("Invalid Stop %s", stop_id);
		//throw stop_id;
		return;
	}

	Active.STOP = stop_id;

	var stopDiv = document.getElementById("stop");
	if (streetview) {
		streetview.setPosition(new google.maps.LatLng(buses.stops[stop_id].stop_lat, buses.stops[stop_id].stop_lon));
	}
	if (map) {
		for (var mkr = 0; mkr < markers.length; mkr++) {
			//markers[mkr].setAnimation(null);
			if (markers[mkr].activeInRoute || Active.Route.ID === null) {
				markers[mkr].setIcon(normal);
			} else if (Active.Route.ID !== null) {
				markers[mkr].setIcon(unimportant);
			}
			if (markers[mkr].stop_id == buses.stops[stop_id].stop_id) {
				stopMarker = markers[mkr];
			}
		}

		stopMarker.setIcon(stopShape);
		stopMarker.setZIndex(300);

		streetview.setPosition(stopMarker.getPosition());
		google.maps.event.trigger(streetview, "resize");
		google.maps.event.addListener(streetview, "pano_changed", function() {
			document.getElementById("address").textContent = streetview.location.description;
			streetview.setPov(streetview.getPhotographerPov());
		});
	}
	if (!streetview) {
		document.getElementById("stop").classList.add("no-streetview");
	}

	document.getElementById("stop_name").textContent = buses.stops[stop_id].stop_name;

	var list = document.getElementById("connections");
	while (list.hasChildNodes()) {
    list.removeChild(list.lastChild);
	}
	for (var i = 0; i < buses.stops[stop_id].routes.length; i++) {
		var route = buses.routes[buses.stops[stop_id].routes[i]];
		var listItem = document.createElement("li");
		var linkItem = dynamicLinkNode(Type.ROUTE, buses.stops[stop_id].routes[i], false);
		linkItem.style.borderColor = "#" + route.route_color;
		linkItem.textContent = route.route_long_name;

		listItem.appendChild(linkItem);
		if (Active.Route.ID == buses.stops[stop_id].routes[i]) {
			listItem.className = "active-route";
		}
		list.appendChild(listItem);
	}

	document.getElementById("main").classList.add("open-stop");
	this.dispatchEvent(updateEvent);
}

function openTrip(trip_id) {
	if (!buses.routes[Active.Route.ID].trips[trip_id] || !buses.routes[Active.Route.ID].trips[trip_id].trip_id) {
		console.error("Invalid trip %s in route %s", trip_id, Active.Route.ID);
		//throw trip_id;
		return;
	}

	Active.Route.TRIP = trip_id;

	var schedule = document.getElementById("schedule");
	while (schedule.hasChildNodes()) {
    schedule.removeChild(schedule.lastChild);
	}

	var trip = buses.routes[Active.Route.ID].trips[trip_id];
	var stopSequence = sequence(trip.stop_times);

	var select = document.getElementById("trip-select");
	for (var option = 0; option < select.options.length; option++) {
		if (select.options[option].value == trip_id) {
			select.selectedIndex = option;
			select.options[option].selected = true;
			break;
		}
	}

	document.getElementById("week-days-value").textContent = buses.calendar[trip.service_id].text_name;

	for (var i = 0; i < stopSequence.length; i++) {
		var tripStop = trip.stop_times[stopSequence[i]];
		var routeListItem = dynamicLinkNode(Type.STOP, tripStop.stop_id);

		var lines = document.createElement("div");
		lines.className = "lines";
		for (var j = 0; j < 2; j++) {
			var line = document.createElement("span");
			line.className = "line";
			line.style.backgroundColor = "#" + buses.routes[Active.Route.ID].route_color;
			lines.appendChild(line);
		}
		routeListItem.appendChild(lines);

		var name = document.createElement("span");
		name.className = "name";
		name.textContent = buses.stops[tripStop.stop_id].stop_name;
		routeListItem.appendChild(name);

		var time = document.createElement("time");
		time.textContent = gtfsArrivalToString(tripStop.arrival_time);
		routeListItem.appendChild(time);

		var connection = document.createElement("div");
		connection.className = "connections";
		for (var k = 0; k < buses.stops[tripStop.stop_id].routes.length; k++) {
			var connectRoute = buses.stops[tripStop.stop_id].routes[k];
			if (connectRoute == Active.Route.ID) {continue;}

			var item = document.createElement("span");
			item.className = "route-dash";
			item.title = buses.routes[connectRoute].route_long_name;
			item.style.backgroundColor = buses.routes[connectRoute].route_color;

			connection.appendChild(item);
		}
		routeListItem.appendChild(connection);
		schedule.appendChild(routeListItem);
	}

	this.dispatchEvent(updateEvent);
}

/**
 * Opens a dialog with information that user requests
 * @param  {-} id ID of the dialog information
 * @return {void}    shows the dialog element
 */
function openDialog(id) {

}