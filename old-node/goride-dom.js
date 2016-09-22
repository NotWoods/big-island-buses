var express = require('express'),
    app = express(),
    router = express.Router(),
    dom = require('express-dom'),
    JSZip = require('jszip'),
    fs = require('fs'),
    oboe = require('oboe');
    require('es6-promise').polyfill();

var Type = {
	ROUTE: 0,
	STOP: 1,
	TRIP: 2
},
Active = {
	Route: {
		ID: null,
		TRIP: null
	},
	STOP: null
};

function iB(i) {return parseInt(i,10)!==0?true:false;}

function serviceToString(service_id, calendar) {
	if (!calendar[service_id]) {console.error("Invalid service_id %s", service_id); return;}
	var days = calendar[service_id].days;
	var strings = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

	if (days.indexOf(false) == -1) {
		return "Daily";
	} else if (days[0] && !days[1] && !days[2] && !days[3] && !days[4] && !days[5] && days[6]) {
		return "Sa-Su";
	} else {
		return [strings[days.indexOf(true)], "-", strings[days.lastIndexOf(true)]].join('');
	}
}

function pageLink(type, value, ajaxLinks) {
	var link = ["/"];
	if (ajaxLinks) {
		switch (type) {
			case Type.ROUTE:
				link.push("#!route=", value);
	
				if (Active.Route.TRIP !== null) {link.push("&trip=", Active.Route.TRIP);} 
				if (Active.STOP !== null) {link.push("&stop=", Active.STOP);}
				break;
			case Type.STOP:
				if (Active.Route.ID !== null) {
					link.push("#!route=", Active.Route.ID);
					if (Active.Route.TRIP !== null) {link.push("&trip=", Active.Route.TRIP);}
					if (value !== null) {link.push("&stop=", value);}
				} else {
					if (value !== null) {link.push("!#stop=", value);}
				}
				break;
			case Type.TRIP:
				link.push("#!route= ", Active.Route.ID, "&trip=", value);
				if (Active.STOP !== null) {link.push("&stop=", Active.STOP);}
				break;
			default:
				console.warn("Invalid type provided for link: %i", type);
				break;
		}
		return link.join('');
	} else {
		switch (type) {
			case Type.ROUTE:
				link.push(value);
	
				if (Active.Route.TRIP !== null) {link.push("/", Active.Route.TRIP);} 
				if (Active.STOP !== null) {link.push("?stop=", Active.STOP);}
				break;
			case Type.STOP:
				if (Active.Route.ID !== null) {
					link.push(Active.Route.ID);
					if (Active.Route.TRIP !== null) {link.push("/", Active.Route.TRIP);}
				} 
				link.push("?stop=", value);
				break;
			case Type.TRIP:
				link.push(Active.Route.ID, "/", value);
				if (Active.STOP !== null) {link.push("?stop=", Active.STOP);}
				break;
			default:
				console.warn("Invalid type provided for link: %i", type);
				break;
		}
		return link.join('');
	}
}

function dynamicLinkNode(type, value, document, ajaxLinks) {
	var node = document.createElement("a");
	node.Type = type;
	node.Value = value;
	node.href = pageLink(type, value, ajaxLinks);

	return node;
}

function stringTime(date) {
	if (typeof date == "string") {
		if (date.indexOf(":") > -1 && date.lastIndexOf(":") > date.indexOf(":")) {
			var split = date.split(":");
			date = new Date(0,0,0,split[0],split[1],split[2],0);
		}
	} else if (typeof date != "object") {
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
		displayMinute = [":0", min.toString()].join('');
	} else {
		displayMinute = [":", min.toString()].join('');
	}

	return [displayHour, displayMinute, m].join('');
}

function gtfsArrivalToDate(string) {
	var timeArr = string.split(":");
	var extraDays = 0, extraHours = 0;
	if (parseInt(timeArr[0]) > 23) {
		extraDays = Math.floor(parseInt(timeArr[0]) / 24);
		extraHours = parseInt(timeArr[0]) % 24;
	}
	return new Date(0,0,0 + extraDays, parseInt(timeArr[0]) + extraHours,timeArr[1],timeArr[2],0);
}

function gtfsArrivalToString(string) {
	return stringTime(gtfsArrivalToDate(string));
}

function nowDateTime() {
	var now = new Date();
	return new Date(0,0,0,now.getHours(),now.getMinutes(),now.getSeconds(),0);
}

function sequence(stopTimes) {
	var stopSequence = [];
	for (var key in stopTimes) {stopSequence.push(key);}
	return stopSequence.sort(function(a, b) {return parseInt(a) - parseInt(b);});
}

function loadAside(busSchedule, document, ajaxLinks) {
	var routesList, routeListItems = [];
	for (var item in busSchedule.routes) {
		var listItem = document.createElement("li");
		listItem.style.borderColor = ["#", busSchedule.routes[item].route_color].join('');
		listItem.route_id = busSchedule.routes[item].route_id;
		var link = dynamicLinkNode(Type.ROUTE, busSchedule.routes[item].route_id, document, ajaxLinks);
		link.textContent = busSchedule.routes[item].route_long_name;
		listItem.appendChild(link);
		routeListItems.push(listItem);
	}

	routesList = document.getElementById("other");
	for (var j = 0; j < routeListItems.length; j++) routesList.appendChild(routeListItems[j]);
	return;
}

function openRoute(busSchedule, document, route_id) {
	if (route_id === null || !busSchedule.routes[route_id] || !busSchedule.routes[route_id].route_id) {return null;}

	var thisRoute = busSchedule.routes[route_id];
	Active.Route.ID = route_id;
	Active.Route.TRIP = null;

	document.title = [thisRoute.route_long_name, " | Big Island Buses"].join('');

	var content = document.getElementById("content");
	var name = document.getElementById("route_long_name");
	name.textContent = thisRoute.route_long_name;
	name.style.backgroundColor = ["#", thisRoute.route_color].join('');
	name.style.color = ["#", thisRoute.route_text_color].join('');
	document.getElementById("alt-menu").style.fill = ["#", thisRoute.route_text_color].join('');

	var firstStop, lastStop, largest = 0;
	var earliest = new Date(0, 0, 0, 23, 59, 59, 0), 
	latest = new Date(0, 0, 0, 0, 0, 0, 0), earliestTrip, earliestTripStop;

	var nowTime = nowDateTime();
	var closestTrip, closestTripTime = Number.MAX_VALUE, closestTripStop;
	var select = document.getElementById("trip-select"), selectFragment = document.createDocumentFragment();
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
		selectFragment.appendChild(option);
	}
	select.appendChild(selectFragment);

	var minString = Math.floor(closestTripTime/60000) != 1 ? [Math.floor(closestTripTime/60000), " minutes"].join('') : "1 minute";
	document.getElementById("place-value").textContent = ["Between ", 
		busSchedule.stops[firstStop].stop_name, " - ", busSchedule.stops[lastStop].stop_name].join('');
	document.getElementById("time-value").textContent = [stringTime(earliest), " - ", stringTime(latest)].join('');
	document.getElementById("next-stop-value").textContent = ["Reaches ", busSchedule.stops[closestTripStop].stop_name, " in ", minString].join('');

	if (document.getElementById("main").className.indexOf("opn-stop") > -1) {document.getElementById("main").className = "open opn-stop";}
	else {document.getElementById("main").className = "open";}
	
	return closestTrip;
}

function openStop(busSchedule, document, ajaxLinks, stop_id) {
	if (stop_id === null || !busSchedule.stops[stop_id] || !busSchedule.stops[stop_id].stop_id) {return null;}

	Active.STOP = stop_id;
	var thisStop = busSchedule.stops[stop_id];

	var stopDiv = document.getElementById("stop");
	stopDiv.setAttribute("itemscope");
	stopDiv.setAttribute("itemtype", "https://schema.org/BusStop");

	document.getElementById("streetview-image").src = ["https://maps.googleapis.com/maps/api/streetview?size=640x427&location=", thisStop.stop_lat, ",", thisStop.stop_lon, "&key=AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI"].join('');
	document.getElementById("streetview-image").setAttribute("itemprop", "image");

	document.getElementById("stop_name").textContent = thisStop.stop_name;
	document.getElementById("stop_name").setAttribute("itemprop", "name");

	var list = document.getElementById("connections"), listFragment = document.createDocumentFragment();
	while (list.hasChildNodes()) {
    list.removeChild(list.lastChild);
	}
	for (var i = 0; i < thisStop.routes.length; i++) {
		var route = busSchedule.routes[thisStop.routes[i]];
		var listItem = document.createElement("li");
		var linkItem = dynamicLinkNode(Type.ROUTE, thisStop.routes[i], document, ajaxLinks);
		linkItem.style.borderColor = ["#", route.route_color].join('');
		linkItem.textContent = route.route_long_name; 

		listItem.appendChild(linkItem);
		if (Active.Route.ID == thisStop.routes[i]) {
			listItem.className = "active-route";
		}
		listFragment.appendChild(listItem);
	}
	list.appendChild(listFragment);

	if (document.getElementById("main").className.indexOf("open") > -1) {document.getElementById("main").className = "open opn-stop";}
	else {document.getElementById("main").className = "opn-stop";}
	return stop_id;
}

function openTrip(busSchedule, document, ajaxLinks, trip_id) {
	if (trip_id == null) {return null;}
	if (!busSchedule.routes[Active.Route.ID] || !busSchedule.routes[Active.Route.ID].route_id) {return null;}
	if (!busSchedule.routes[Active.Route.ID].trips[trip_id] || !busSchedule.routes[Active.Route.ID].trips[trip_id].trip_id) {return null;}

	Active.Route.TRIP = trip_id;

	var schedule = document.getElementById("schedule"), scheduleFragment = document.createDocumentFragment();
	while (schedule.hasChildNodes()) {
    schedule.removeChild(schedule.lastChild);
	}

	var trip = busSchedule.routes[Active.Route.ID].trips[trip_id],
		stopSequence = sequence(trip.stop_times);

	var select = document.getElementById("trip-select");
	for (var option = 0; option < select.options.length; option++) {
		if (select.options[option].value == trip_id) {
			select.selectedIndex = option;
			select.options[option].selected = true;
			break;
		}
	}

	document.getElementById("week-days-value").textContent = busSchedule.calendar[trip.service_id].text_name;

	for (var i = 0; i < stopSequence.length; i++) {
		var tripStop = trip.stop_times[stopSequence[i]];
		var routeListItem = dynamicLinkNode(Type.STOP, tripStop.stop_id, document, ajaxLinks);
		
		var lines = document.createElement("div");
		lines.className = "lines";
		for (var j = 0; j < 2; j++) {
			var line = document.createElement("span");
			line.className = "line";
			line.style.backgroundColor = ["#", busSchedule.routes[Active.Route.ID].route_color].join('');
			lines.appendChild(line);
		}
		routeListItem.appendChild(lines);

		var name = document.createElement("span");
		name.className = "name";
		name.textContent = busSchedule.stops[tripStop.stop_id].stop_name;
		routeListItem.appendChild(name);

		var time = document.createElement("time");
		time.textContent = gtfsArrivalToString(tripStop.arrival_time);
		routeListItem.appendChild(time);

		var connection = document.createElement("div");
		connection.className = "connections";
		for (var k = 0; k < busSchedule.stops[tripStop.stop_id].routes.length; k++) {
			var connectRoute = busSchedule.stops[tripStop.stop_id].routes[k];
			if (connectRoute == Active.Route.ID) {continue;}

			var item = document.createElement("span");
			item.className = "route-dash";
			item.title = busSchedule.routes[connectRoute].route_long_name;
			item.style.backgroundColor = busSchedule.routes[connectRoute].route_color;

			connection.appendChild(item);
		}
		routeListItem.appendChild(connection);
		scheduleFragment.appendChild(routeListItem);
	}
	schedule.appendChild(scheduleFragment);
	return trip_id;
}

function loadDocument(isRoot, ajax, route, trip, stop, callback) {
	Active.Route.ID = route ? route : Active.Route.ID;
	Active.Route.TRIP = trip ? trip : Active.Route.TRIP;
	Active.STOP = stop ? stop : Active.STOP;
	Promise.all([schedulePromise, htmlPromise]).then(function(results) {
		jsdom.env(results[1], function (errors, window) {
  	  var document = window.document;
  	  
  	  if (!ajax) {
  	  	var canon = document.createElement("link");
  	  	canon.rel = "canonical";
  	  	canon.href = pageLink(Type.STOP, stop, true);
  	  	document.head.appendChild(canon);
  	  }
  	 	
  	 	loadAside(results[0], document, ajax);

  	 	var streetImg = document.createElement("img");
  	 	streetImg.id = "streetview-image";
  	 	document.getElementById("streetview-canvas").appendChild(streetImg);

  	 	var opend = {r:null,t:null,s:null};
			if (route !== null) {
				opend.r = openRoute(results[0], document, Active.Route.ID);
				opend.t = openTrip(results[0], document, ajax, Active.Route.TRIP ? Active.Route.TRIP : opend.r);
			}
			if (stop !== null) {
				opend.s = openStop(results[0], document, ajax, Active.STOP);
			}
			if (opend.r == null && opend.t == null && opend.s == null && !isRoot) {
				callback(404); return;
			} else {
				var result = ["<!doctype html>", document.documentElement.outerHTML].join('');
				window.close();
				callback(null, result); return;
			}
  	});
	});
}

app.enable('trust proxy');

var schedulePromise = new Promise(function(resolve, reject) {
	/*fs.readFile(__dirname + "/output.json", {encoding:"utf8"}, function(err, data) {
		if (err) {console.error(err);reject(err);}
		busSchedule = JSON.parse(data);
		resolve();
	});*/
	oboe(fs.createReadStream(__dirname + "/output.json")).done(function(data) {
		resolve(data);
	})
});

var htmlPromise = new Promise(function(resolve, reject) {
	fs.readFile(__dirname + "/index.html", {encoding:"utf8"}, function(err, data) {
		if (err) {console.error(err);reject(err);}
		resolve(data);
	});
});

var homePage = new Promise(function(resolve, reject) {
	loadDocument(true, false, null, null, null, function(err, doc) {resolve(doc);});
})

function getFragmentQuery(item, fragment) {
		for (var i = 0; i < fragment.length; i++) {
			var splitItem = fragment[i].split("=");
			if (splitItem[0] == item) return splitItem[1];
		}
		return null;
	}

app.use("/", function(req, res, next) {
	var Active = {
		Route: {
			ID: null,
			TRIP: null
		},
		STOP: null
	};
	if (req.query._escaped_fragment_) {
		var frag = req.query._escaped_fragment_.split("&");
		loadDocument(false, true, getFragmentQuery("route", frag), getFragmentQuery("trip", frag), getFragmentQuery("stop", frag), 
		function(err, doc) {
			if (err != null) res.status(err).end(); else res.send(doc);
		});
	} else {
		next();
	}
});

app.get("/", function(req, res, next) {
	homePage.then(function(doc) {res.send(doc);});
});

app.get("/:route", function(req, res, next) {
	var route = req.params.route ? req.params.route : null,
	    stop = req.query.stop ? req.query.stop : null;
	loadDocument(false, false, route, null, stop, function(err, doc) {
		if (err != null) res.status(err).end(); else res.send(doc);});
});

app.get("/:route/:trip", function(req, res, next) {
	var route = req.params.route ? req.params.route : null,
	    trip = req.params.trip ? req.params.trip : null,
	    stop = req.query.stop ? req.query.stop : null;
	loadDocument(false, false, route, trip, stop, function(err, doc) {
		if (err != null) res.status(err).end(); else res.send(doc);});
});

fs.watch(__dirname + "/hawaii-gtfs", {}, function(e, f) {
	if (f !== null && f.indexOf(".txt") == f.length - 4) {
		console.log("%s has been updated, generating new files", f);
		parseScheduleSource();
	}
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);
});