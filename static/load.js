/**
 * Contains construstors and helper functions.  Avoids using the DOM for functions.
 * @author       Tiger Oakes <tigeroakes@gmail.com>
 * @copyright    2014 Tiger Oakes
 */

var Type = {
	ROUTE: 0,
	STOP: 1,
	TRIP: 2
},
View = {
	LIST: 0,
	TIMETABLE: 1,

	MAP_PRIMARY: 2,
	STREET_PRIMARY: 3
},
Active = {
	Route: {
		ID: null,
		TRIP: null
	},
	STOP: null,
	View: {
		ROUTE: View.LIST,
		STOP: View.MAP_PRIMARY
	}
},
updateEvent = new CustomEvent("pageupdate"), updateLocation = new CustomEvent("locationupdate");

var map, streetview, autocomplete, boundsAllStops, markers, userMapMarker, stopMarker;

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
};

/**
 * Grabs google_transit.zip and parses the data into a
 * GTFSData object for the rest of the program.
 * @param  {string} mode "folder" or "gtfs". Will grab the
 *                       google_transit folder or zip file depending on input
 * @return {Promise}     Promise returns parsed GTFS data file for the rest of the program
 */
function getScheduleData(mode) {
	if (mode != "gtfs" && mode != "folder") {
		console.error("Invalid mode was set: %s. Use 'gtfs' or 'folder'", mode);
		return;
	}

	function GTFSData() { this.routes = {}; this.stops = {}; this.calendar = {}; }

	var variable = new GTFSData();

	fileList = ["agency.txt", "calendar.txt", "fare_attributes.txt", "feed_info.txt",
		"routes.txt", "stop_times.txt", "stops.txt", "trips.txt"];

	return new Promise(function(resolve, reject) {
		var rqDone;

		function folderRequest(fileName) {
			return new Promise(function(rqResolve, rqReject) {
				var rq = new XMLHttpRequest();
				rq.open("GET", "google_transit/" + fileName);
				rq.onload = function() {if (this.status == 200) {
					rqResolve({
						name: fileName.substring(0, fileName.length - 4),
						body: this.response
					});
				} else {rqReject(Error(this.statusText));}};
				rq.onerror = function() {rqReject(Error("Network Error"));};
				rq.send();
			});
		}

		if (mode == "gtfs") {
			rqDone = new Promise(function(rqResolve, rqReject) {
				var rq = new XMLHttpRequest();
				rq.open("GET", "google_transit.zip");
				rq.responseType = "arraybuffer";
				rq.onload = function() {if (this.status == 200) {
					var zip = new JSZip(this.response), txt = [];
					for (var i = 0; i < fileList.length; i++) {
						var fileName = fileList[i];
						txt.push({
							name: fileName.substring(0, fileName.length - 4),
							body: zip.file(fileName).asText()
						});
					}
					rqResolve(txt);
				} else {rqReject(Error(this.statusText));}};
				rq.onerror = function() {reject(Error("Network Error"));};
				rq.send();
			});
		} else if (mode == "folder") {
			rqDone = Promise.all(fileList.map(folderRequest));
		}

		rqDone.then(function(textResult) {
			var json = {};
			for (var h = 0; h < textResult.length; h++) {
				json[textResult[h].name] = [];
				var csv = textResult[h].body.split("\n");
				for (var i = 0; i < csv.length; i++) {
					csv[i] = csv[i].replace(/(\r\n|\n|\r)/gm,"").split(",");

					if (i > 0) {
						var jsonFromCsv = {};
						for (var j = 0; j < csv[0].length; j++) jsonFromCsv[csv[0][j]] = csv[i][j];
						json[textResult[h].name].push(jsonFromCsv);
					}
				}
			}

			for (var r = 0; r < json.routes.length; r++) {
				var tr = json.routes[r], vr = variable.routes;
				vr[tr.route_id] = tr; vr[tr.route_id].trips = {};
			}
			for (var t = 0; t < json.trips.length; t++) {
				var tt = json.trips[t], vt = variable.routes[tt.route_id].trips;
				vt[tt.trip_id] = tt; vt[tt.trip_id].stop_times = {};
			}
			for (var s = 0; s < json.stops.length; s++) {
				var ts = json.stops[s], vs = variable.stops;
				vs[ts.stop_id] = ts; vs[ts.stop_id].trips = []; vs[ts.stop_id].routes = [];
			}
			for (var c = 0; c < json.calendar.length; c++) {
				var tc = json.calendar[c], vc = variable.calendar;
				vc[tc.service_id] = tc; vc[tc.service_id].days = [iB(tc.sunday), iB(tc.monday), iB(tc.tuesday), iB(tc.wednesday),
					iB(tc.thursday), iB(tc.friday), iB(tc.saturday)];
				switch (vc[tc.service_id].days.join(", ")) {
					case "true, true, true, true, true, true, true": vc[tc.service_id].text_name = "Daily"; break;
					case "false, true, true, true, true, true, true": vc[tc.service_id].text_name = "Monday - Saturday"; break;
					case "false, true, true, true, true, true, false": vc[tc.service_id].text_name = "Monday - Friday"; break;
					case "true, false, false, false, false, false, true": vc[tc.service_id].text_name = "Saturday - Sunday"; break;
					case "false, false, false, false, false, false, true": vc[tc.service_id].text_name = "Saturday"; break;
					default:
						var firstDay; var lastDay;
						for (var sItr = 0; sItr < vc[tc.service_id].days.length; sItr++) {if (vc[tc.service_id].days[sItr]) {firstDay = sItr; break;}}
						for (var sItr2 = vc[tc.service_id].days.length-1; sItr2 >= 0; sItr2--) {if (vc[tc.service_id].days[sItr2]) {lastDay = sItr2; break;}}
						var reference = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
						if (firstDay == lastDay) {vc[tc.service_id].text_name = reference[firstDay];}
						else {vc[tc.service_id].text_name = reference[firstDay] + " - " + reference[lastDay];}
					break;
				}
			}
			for (var st = 0; st < json.stop_times.length; st++) {
				for (var sr = 0; sr < json.routes.length; sr++) {
					var tst = json.stop_times[st], tsr = json.routes[sr].route_id, vst = variable.stops[tst.stop_id];
					if (variable.routes[tsr].trips[tst.trip_id]) {
						variable.routes[tsr].trips[tst.trip_id].stop_times[tst.stop_sequence] = tst;
						if (vst.trips.indexOf(tst.trip_id) == -1) vst.trips.push({
							trip: tst.trip_id,
							dir: variable.routes[tsr].trips[tst.trip_id].direction_id,
							route: tsr,
							sequence: tst.stop_sequence,
							time: tst.arrival_time
						});
						if (vst.routes.indexOf(tsr) == -1) vst.routes.push(tsr);
					}
				}
			}

			resolve(variable);
		}).catch(reject);
	});
}

/**
 * Locates the nearest bus stop to the user or custom location
 * @param  {Promise} schedulePromise Schedule promise to wait for
 * @param  {Geoposition.coords} customLocation Location to use instead of GPS
 * @return {Promise}
 */
var runOnce = false;
function locateUser(busPromise, customLocation) {
	return new Promise(function(resolve, reject) {
		function locate(e) {
			var closestDistance = Number.MAX_VALUE, closestStop;
			var userPos = e.coords;
			busPromise.then(function(schedule) {
				for (var i in schedule.stops) {
					var stop = schedule.stops[i],
					distance = Math.sqrt(Math.pow(userPos.latitude - parseFloat(stop.stop_lat),2) +
						Math.pow(userPos.longitude - parseFloat(stop.stop_lon),2));
					if (distance < closestDistance) { closestStop = i; closestDistance = distance; }
				}
				if (closestStop) {
					var results = {stop: closestStop, location: userPos, custom: e.customLocationFlag?true:false};
					if (runOnce) {results.dispatchEvent(updateLocation);}
					resolve(results);
				} else {reject(Error(userPos));}
			});
		}
		if (customLocation) {
			locate({coords: customLocation, customLocationFlag: true});
		} else {
			navigator.geolocation.getCurrentPosition(locate);
		}
	});
}

/**
 * Creates a promise version of the document load event
 * @return {Promise} resolves if document has loaded
 */
function documentLoad() {
	return new Promise(function(resolve, reject) {
		if (document.readyState == "interactive" || document.readyState == "complete") {
			resolve(document.readyState);
		} else {
			document.addEventListener("readystatechange", function() {
				if (document.readyState == "interactive") {resolve(document.readyState);}
			});
		}
	});
}

/**
 * Turns a number into a boolean.
 * @param  {int} i   0 returns false, 1 returns true
 * @return {boolean}
 */
function iB(i) {return parseInt(i,10)!==0?true:false;}

/**
 * Turns a service id into a string
 * @param  {string} service_id [description]
 * @param  {object} calendar [description]
 * @return {string}            [description]
 */
function serviceToString(service_id, calendar) {
		if (!calendar[service_id]) {console.error("Invalid service_id %s", service_id); return;}
		var days = calendar[service_id].days;
		var strings = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

		if (days.indexOf(false) == -1) {
			return "Daily";
		} else if (days[0] && !days[1] && !days[2] && !days[3] && !days[4] && !days[5] && days[6]) {
			return "Sa-Su";
		} else {
			return strings[days.indexOf(true)] + "-" + strings[days.lastIndexOf(true)];
		}
	}

/**
 * Generates a link for href values. Meant to maintain whatever active data is avaliable.
 * @param {Type} type  		Type of item to change
 * @param {string} value 	ID to change
 * @return {string} URL to use for href, based on active object.
 */
function pageLink(type, value) {
	var link = "";
	switch (type) {
		case Type.ROUTE:
			link += "#!route=" + value;

			if (Active.Route.TRIP !== null) {
				link += "&trip=" + Active.Route.TRIP;
			}

			if (Active.STOP !== null) {
				link += "&stop=" + Active.STOP;
			}
			break;
		case Type.STOP:
			if (Active.Route.ID !== null) {link += "#!route=" + Active.Route.ID;} else {link += "#!";}
			link += "&stop=" + value;
			if (Active.Route.TRIP !== null) {link += "&trip=" + Active.Route.TRIP;}
			break;
		case Type.TRIP:
			link += "#!route= " + Active.Route.ID + "&trip=" + value;
			if (Active.STOP !== null) {link += "&stop=" + Active.STOP;}
			break;
		default:
			console.warn("Invalid type provided for link: %i", type);
			break;
	}
	return link;
}

/**
 * Creates an A element with custom click events for links.  Can update itself.
 * @param  {Type} type      What value to change in link
 * @param  {string} value   Value to use
 * @param  {boolean} update Wheter or not to listen for "pageupdate" event and update href
 * @return {Node}           A element with custom properties
 */
function dynamicLinkNode(type, value, update) {
	var node = document.createElement("a");
	node.Type = type;
	node.Value = value;
	node.href = pageLink(type, value);
	node.addEventListener("click", clickEvent);
	if (update) {
		node.addEventListener("pageupdate", function() {node.href = pageLink(type, value);});
	}

	return node;
}

/**
 * Used for the click event of a dynamicLinkNode
 * @param  {Event} e
 */
function clickEvent(e) {
	if (e.preventDefault) {e.preventDefault();}
	if (e.stopPropagation) {e.stopPropagation();}
	var state = Active, val = this.Value, newLink = pageLink(this.Type, val);
	switch (this.Type) {
		case Type.ROUTE:
			state.Route.ID = val;
			openRoute(val);
			break;
		case Type.STOP:
			state.STOP = val;
			openStop(val);
			break;
		case Type.TRIP:
			state.TRIP = val;
			openTrip(val);
			break;
	}
	history.pushState(state, null, newLink);
	if (ga) ga("send", "pageview", {page: newLink, title: document.title});
	return false;
}

/**
 * Turns a date into a string with hours, minutes.
 * @param  {Date} 	date Date to convert
 * @param  {string} date 24hr string in format 12:00:00 to convert to string in 12hr format
 * @return {string}    	String representation of time
 */
function stringTime(date) {
	if (typeof date == "string") {
		if (date.indexOf(":") > -1 && date.lastIndexOf(":") > date.indexOf(":")) {
			var split = date.split(":");
			date = new Date(0,0,0,split[0],split[1],split[2],0);
		}
	} else if (typeof date != "object") {
		//throw typeof date;
		return;
	}

	var m = "am", displayHour = "", displayMinute = "";
	var hr = date.getHours(), min = date.getMinutes();

	if (hr === 0) {
		displayHour = "12";
	} else if (hr === 12) {
		displayHour = "12";
		m = "pm";
	} else if (hr > 12) {
		var mathhr = hr - 12;
		displayHour = mathhr.toString();
		m = "pm";
	} else {
		displayHour = hr.toString();
	}

	if (min === 0) {
		displayMinute = "";
	} else if (min < 10) {
		displayMinute = ":0" + min.toString();
	} else {
		displayMinute = ":" + min.toString();
	}

	return displayHour + displayMinute + m;
}

/**
 * Returns a date object based on the string given
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {Date}
 */
function gtfsArrivalToDate(string) {
	var timeArr = string.split(":");
	var extraDays = 0, extraHours = 0;;
	if (parseInt(timeArr[0]) > 23) {
		extraDays = Math.floor(parseInt(timeArr[0]) / 24);
		extraHours = parseInt(timeArr[0]) % 24;
	}
	return new Date(0,0,0 + extraDays ,parseInt(timeArr[0]) + extraHours,timeArr[1],timeArr[2],0);
}

/**
 * Combines stringTime() and gtfsArrivalToDate()
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {string}        String representation of time
 */
function gtfsArrivalToString(string) {
	return stringTime(gtfsArrivalToDate(string));
}

/**
 * Returns a URL variable, or null if it does not exist
 * @param  {string} variable - The name of the query variable to find
 * @return {string}
 */
function getQueryVariable(variable)
{
	var query = "", vars;
	if (window.location.hash.indexOf("#!") > -1) {
		query = window.location.hash.substring(window.location.hash.indexOf("#!") + 2);
		vars = query.split("&");
	} else if (window.location.search.indexOf("_escaped_fragment_") > -1) {
		query = window.location.search.substring(window.location.search.indexOf("_escaped_fragment_") + 19);
		vars = query.split("%26");
	}

	if (query !== "") {
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == variable) {return pair[1];}
		}
	}
	return null;
}

/**
 * Returns the current time, with date stripped out
 * @return {Date} Current time in hour, min, seconds; other params set to 0
 */
function nowDateTime() {
	var now = new Date();
	return new Date(0,0,0,now.getHours(),now.getMinutes(),now.getSeconds(),0);
}

/**
 * Sorts stop time keys
 * @param  {GTFSData stop_times} stopTimes
 * @return {Array}           ordered list
 */
function sequence(stopTimes) {
	var stopSequence = [];
	for (var key in stopTimes) {stopSequence.push(key);}
	return stopSequence.sort(function(a, b) {return parseInt(a) - parseInt(b);});
}