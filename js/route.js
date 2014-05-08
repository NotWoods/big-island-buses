//http://css-tricks.com/snippets/javascript/get-url-variables/
//	Example URL: http://www.example.com/index.php?id=1&image=awesome.jpg
//	Calling getQueryVariable("id") - would return "1".
//	Calling getQueryVariable("image") - would return "awesome.jpg".
function getQueryVariable(variable)
{
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] === variable){return pair[1];}
	}
	return(false);
}

var jsonUrl = "../data.json";
var data;

var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

if (window.navigator.onLine) {
	console.group("Downloading route and station data");
	console.log("Currently online, trying to download latest data");
	console.time("Elapsed download time");
	var rq = new XMLHttpRequest();
	rq.addEventListener("load", requestComplete, false);
	rq.addEventListener("error", requestFailed, false);
	rq.open("GET", jsonUrl);
	rq.send();
} else {
	console.group("Downloading route and station data");
	console.log("Currently offline, loading from offline data");
	if (localStorage["data"] != null) {
		console.log("Loading data.json version %i", data.version);
		data = JSON.parse(localStorage["data"]);
	} else {
		console.warn("No offline data detected! Loading from packaged file.");
		var localRq = new XMLHttpRequest();
		localRq.open("GET", "../data.json");
		localRq.addEventListener("load", function() {
			console.log("Packaged file loaded, saving to offline data");
			data = JSON.parse(localRq.response);
			localStorage["data"] = JSON.stringify(data);
			localStorage["dataVer"] = data.version;
		}, false);
	}
	console.groupEnd();
	loadRoute();
}

function requestComplete(e) {
	console.log("Download completed successfully");
	console.timeEnd("Elapsed download time");
	data = JSON.parse(rq.responseText);
	console.log("Loading data.json version %i", data.version);
	//Check if the version is greater than the current version
	if (data.version > localStorage["dataVer"]) {
		console.log("Offline data is outdated, now updating");
		localStorage["data"] = JSON.stringify(data);
		localStorage["dataVer"] = data.version;
	}
	console.groupEnd();
	loadRoute();
}

function requestFailed(e) {
	console.warn("Download failed, using offline data");
	console.timeEnd("Elapsed download time");
	if (localStorage["data"] != null) {
		console.log("Loading data.json version %i", data.version);
		data = JSON.parse(localStorage["data"]);
	} else {
		console.warn("No offline data detected! Loading from packaged file.");
		var localRq = new XMLHttpRequest();
		localRq.responseType = "json";
		localRq.open("GET", "../data.json");
		localRq.addEventListener("load", function() {
			console.log("Packaged file loaded, saving to offline data");
			data = localRq.response;
			localStorage["data"] = JSON.stringify(data);
			localStorage["dataVer"] = data.version;
		}, false);
		localRq.send();
	}
	console.groupEnd();
	loadRoute();
}

function genLink(stopId, stopName, subtitle) {
	var theLink;
	if (subtitle == null) {
		theLink = '<a class="name" href="../stop/?id=' + 
			stopId + '">' + stopName + '</a>'
	} else {
		theLink = '<a class="name sub" href="../stop/?id=' + 
			stopId + '">' + stopName + '<br><span>' + 
			subtitle + '</span></a>'
	}
	return theLink
}

function timeAdd(hrBase, minBase) {
	var newTime;
	var meridiem = " AM";
	
	if (hrBase % 1 == 0.5) {
		hrBase -= 0.5;
		minBase += 30;
	} else if (hrBase % 1 == 0.25) {
		hrBase -= 0.25;
		minBase += 15;
	} else if (hrBase % 1 == 0.75) {
		hrBase -= 0.75;
		minBase += 45;
	}
	
	// If there are more than 60 minutes to add
	if (minBase >= 60) {
		hrBase += Math.floor(minBase / 60);
		minBase = minBase % 60;
	} else if (minBase < 0) {
		if (minBase <= -60) {
			hrBase -= Math.ceil(minBase / 60);
			minBase = minBase % 60;
		} else {
			hrBase -= 1;
			minBase = 60 + minBase;
		}
	}
	
	// If PM instead of AM
	if (hrBase > 12) {
		hrBase -= 12;
		meridiem = " PM";
	} else if (hrBase == 0) {
		hrBase = 12;
		meridiem = " AM";
	} else if (hrBase < 0) {
		hrBase += 12;
		meridiem = " PM";
	}
	
	// If the minute is 1 digit
	if (minBase >= 0 && minBase < 10) {
		newTime = hrBase.toString() + ":" + "0" + minBase.toString() + meridiem;
	} else {
		newTime = hrBase.toString() + ":" + minBase.toString() + meridiem;
	}
	
	return newTime;
}

function loadConnections(stationId, routeName, displayTitle) {
	if (data.station[stationId].connections != null) {
		var connect;
		if (routeName == false || routeName == null) {
			connect = JSON.parse(JSON.stringify(data.station[stationId].connections));
		} else {
			connect = JSON.parse(JSON.stringify(data.station[stationId].connections));
			// Remove the current route and leave the others
			var index = connect.indexOf(routeName);
			connect.splice(index, 1);
		}
		
		var returnThis = "";
		if (displayTitle == false || displayTitle == null) {
			for (var j = 0; j < connect.length; j++) {
				returnThis += '<a href="../route/?name=' + connect[j] + 
					'" class="line ' + connect[j] + '"></a>';
			}
			
			returnThis += '<span class="tooltip">Connects to ';
			if (connect.length == 1) {
				returnThis += '"' + data.route[connect[0]].name + '"';
			} else if (connect.length == 2) {
				returnThis += '"' + data.route[connect[0]].name + '" and "' +
					data.route[connect[1]].name + '"';
			} else {
				for (var k = 0; k < connect.length; k++) {
					if (k == (connect.length - 1)) {
						returnThis += 'and "' + data.route[connect[k]].name + '"';
					} else {
						returnThis += '"' + data.route[connect[k]].name + '", ';
					}
				}
			}
			returnThis += '</span>';
		} else if (displayTitle) {
			for (var j = 0; j < connect.length; j++) {
				returnThis += '<a href="../route/?name=' + connect[j] + 
					'" class="line ' + connect[j] + '">' + 
					data.route[connect[j]].name + '</a>';
			}
		}
		
		return returnThis;
	} else {
		return "";
	}
}

function getBestTime(hours, now, possible) {
	var bestTime;
	var min = hours[0];
	var max = hours[hours.length - 1];
	
	if (possible != false && possible != null) {
		var newHours = new Array();
		for (var t = 0; t < hours.length; t++) {
			if (possible[hours[t].toString()] != null) {
				newHours.push(hours[t]);
			}
		}
		hours = newHours;
		min = newHours[0];
		max = newHours[newHours.length - 1];
	}
	
	var hasFloat = false;
	for (var u = 0; u < hours.length; u++) {
		if (hours[u] % 1 == 0.5) {
			hasFloat = 1;
		} else if (hours[u] % 1 == 0.25 || hours[u] % 1 == 0.75) {
			hasFloat = 3;
			break;
		}
	}
	
	if (now === null || now === false) {
		bestTime = new Date().getHours();
		if (new Date().getMinutes >= 30 && hasFloat != false) {
			bestTime += 0.5;
		} else if (new Date().getMinutes >= 15 && hasFloat == 3 && new Date().getMinutes < 30) {
			bestTime += 0.25;
		} else if (new Date().getMinutes >= 45 && hasFloat == 3) {
			bestTime += 0.25;
		}
	} else {
		if (hasFloat == 1 || hasFloat == 2) {
			bestTime = parseFloat(now);
		} else {
			bestTime = parseInt(now);
		}
	}
	if (bestTime >= max && bestTime <= 23) {
		bestTime = max;
	} else if (bestTime <= min && bestTime >= 0) {
		bestTime = min;
	} else if (isInArray(bestTime, hours)) {
		bestTime = bestTime;
	} else if (!isInArray(bestTime, hours)) {
		if (hasFloat == 1) {
			for (var r = 0.5; r < 24; r+=0.5) {
				if (isInArray(bestTime + r, hours)) {
					bestTime += r;
					break;
				}
			}
		} else if (hasFloat == 3) {
			for (var r = 0.25; r < 24; r+=0.25) {
				if (isInArray(bestTime + r, hours)) {
					bestTime += r;
					break;
				}
			}
		} else {
			for (var r = 1; r < 24; r++) {
				if (isInArray(bestTime + r, hours)) {
					bestTime += r;
					break;
				}
			}
		}
	}
	return bestTime;
}

function isInArray(value, array) {
	return array.indexOf(value) > -1;
}

var schHour;
var prop;

function loadRoute() {
	var routeName = getQueryVariable("name");
	var direction = getQueryVariable("dir");
	var time = getQueryVariable("time");
	var routeData = data.route[routeName];
	
	if (!routeName) {
		window.location = "../";
		return;
	}
	
	// If no direction is specified, set the direction to "in".
	if (!direction) {
		direction = "in";
	}
	
	if (routeData.dir != null) {
		direction = "dir";
	}
	
	if (routeData.consistent === "hour") {
		schHour = getBestTime(routeData.hours, time, routeData[direction]);
	} else if (routeData.consistent === "yes" || routeData.consistent === "day") {
		schHour = getBestTime(routeData.hours, time, false);
	} else if (routeData.consistent === "both") {
		var today = new Date().getDay();
		var params = new Array();
		for (value in routeData[direction]) {
			if (value.length === 1) {
				params[0] = value.charAt(0);
				params[1] = value.charAt(0);
			} else if (value.length === 3) {
				params[0] = value.charAt(0);
				params[1] = value.charAt(2);
			}
			
			if (today >= params[0] && today <= params[1]) {
				prop = value;
			}
		}
		schHour = getBestTime(routeData.hours, time, routeData[direction][prop]);
	}
	
	document.title = routeData.name;
	
	document.getElementById("route-heading").className = routeName;
	document.getElementById("route-heading").innerHTML = routeData.name;
	
	// Load details and operating days from data
	document.getElementById("desc").innerHTML = routeData.details;
	switch (routeData.consistent) {
	case "yes":
		document.getElementById("days").innerHTML = "Operates <strong>" +
			week[routeData.days[0]] + "</strong> through <strong>" +
			week[routeData.days[routeData.days.length - 1]] + "</strong>";
		break;
	case "hour":
		document.getElementById("days").innerHTML = "Operates <strong>" +
			week[routeData[direction][schHour.toString()][0][0]] + "</strong> through <strong>" +
			week[routeData[direction][schHour.toString()][0][routeData[direction][schHour.toString()][0].length - 1]] + "</strong>";
		break;
	case "day":
		document.getElementById("days").innerHTML = "Operates ";
			for (var day in routeData[direction]) {
				document.getElementById("days").innerHTML += "<strong>";
				if (day.length === 3) {
					document.getElementById("days").innerHTML += week[parseInt(day.charAt(0),10)] +
						" to " + week[parseInt(day.charAt(2),10)] + "</strong> and ";
				} else if (day.length === 1) {
					document.getElementById("days").innerHTML += week[parseInt(day,10)] +
						"</strong> and ";
				}
			}
			document.getElementById("days").innerHTML = document.getElementById("days").innerHTML.substr(0, document.getElementById("days").innerHTML.length-5); 
		break;
	case "both":
		document.getElementById("days").innerHTML = "Operates ";
			for (var day in routeData[direction]) {
				document.getElementById("days").innerHTML += "<strong>";
				if (day.length === 3) {
					document.getElementById("days").innerHTML += week[parseInt(day.charAt(0),10)] +
						" to " + week[parseInt(day.charAt(2),10)] + "</strong> and ";
				} else if (day.length === 1) {
					document.getElementById("days").innerHTML += week[parseInt(day,10)] +
						"</strong> and ";
				}
			}
			document.getElementById("days").innerHTML = document.getElementById("days").innerHTML.substr(0, document.getElementById("days").innerHTML.length-5); 
		break;
	}
	
	var list = document.getElementsByClassName("route-list")[0]; 
	
	switch (routeData.consistent) {
	case "yes":
		for (var i = 0; i < routeData[direction].length; i++) {
			//var li = list.createElement("li");
			list.innerHTML += '<li><div class="lines">' + '<span class="icon ' +
				routeName + '">' + routeData[direction][i].id + '</span>' +
				'<span class="marker ' + routeName + '"></span>' + 
				'<span class="marker ' + routeName + '"></div><!--' +
				'--><span class="stop">' + 
				genLink(routeData[direction][i].id, routeData[direction][i].name, routeData[direction][i].sub) +	
				'<time>' + timeAdd(schHour, routeData[direction][i].add) +
				'</time><div class="data"><div class="connections sz-' + 
				(data.station[routeData[direction][i].id].connections.length - 1) +
				'">' + loadConnections(routeData[direction][i].id, routeName) + 
				'</div></div>' + '</span></li>';
		}
		break;
	case "hour":
		if (routeData[direction][schHour.toString()] === null) {
			for (var s = 1; s < 24; s++) {
				if (routeData[direction][(schHour + s).toString()] != null) {
					schHour += s;
					break;
				}
			}
		}
		var schedule = JSON.parse(JSON.stringify(routeData[direction][schHour.toString()]));
		schedule.splice(0, 1);
		for (var i = 0; i < schedule.length; i++) {
			list.innerHTML += '<li><div class="lines">' + '<span class="icon ' +
				routeName + '">' + schedule[i].id + '</span>' +
				'<span class="marker ' + routeName + '"></span>' + 
				'<span class="marker ' + routeName + '"></div><!--' +
				'--><span class="stop">' + 
				genLink(schedule[i].id, schedule[i].name, schedule[i].sub) +
				'<time>' + timeAdd(schHour, schedule[i].add) +
				'</time><div class="data"><div class="connections sz-' + 
				(data.station[schedule[i].id].connections.length - 1) + '">' +
				loadConnections(schedule[i].id, routeName) + 
				'</div></div>' + '</span></li>';
		}
		break;
	case "day":
		var today = new Date().getDay();
		var params = new Array();
		for (value in routeData[direction]) {
			if (value.length === 1) {
				params[0] = value.charAt(0);
				params[1] = value.charAt(0);
			} else if (value.length === 3) {
				params[0] = value.charAt(0);
				params[1] = value.charAt(2);
			}
			
			if (today >= params[0] && today <= params[1]) {
				prop = value;
			}
		}
		if (prop == null) {
			for (value in routeData[direction]) {
				prop = value;
				break;
			}
		}
		var schedule = routeData[direction][prop];
		for (var i = 0; i < schedule.length; i++) {
			list.innerHTML += '<li><div class="lines">' + '<span class="icon ' +
				routeName + '">' + schedule[i].id + '</span>' +
				'<span class="marker ' + routeName + '"></span>' + 
				'<span class="marker ' + routeName + '"></div><!--' +
				'--><span class="stop">' +
				genLink(schedule[i].id, schedule[i].name, schedule[i].sub) +
				'<time>' + 
				timeAdd(schHour, schedule[i].add) +
				'</time><div class="data"><div class="connections sz-' + 
				(data.station[schedule[i].id].connections.length - 1) + '">' +
				loadConnections(schedule[i].id, routeName) + 
				'</div></div>' + '</span></li>';
		}
		break;
	case "both": 
		var today = new Date().getDay();
		var params = new Array();
		for (value in routeData[direction]) {
			if (value.length === 1) {
				params[0] = value.charAt(0);
				params[1] = value.charAt(0);
			} else if (value.length === 3) {
				params[0] = value.charAt(0);
				params[1] = value.charAt(2);
			}
			
			if (today >= params[0] && today <= params[1]) {
				prop = value;
			}
		}
		if (prop == null) {
			for (value in routeData[direction]) {
				prop = value;
				break;
			}
		}
		
		if (routeData[direction][prop][schHour.toString()] === null) {
			for (var s = 1; s < 24; s++) {
				if (routeData[direction][(schHour + s).toString()] != null) {
					schHour += s;
					break;
				}
			}
		}
		var schedule = routeData[direction][prop][schHour.toString()];
		for (var i = 0; i < schedule.length; i++) {
			list.innerHTML += '<li><div class="lines">' + '<span class="icon ' +
				routeName + '">' + schedule[i].id + '</span>' +
				'<span class="marker ' + routeName + '"></span>' + 
				'<span class="marker ' + routeName + '"></div><!--' +
				'--><span class="stop">' +
				genLink(schedule[i].id, schedule[i].name, schedule[i].sub) +
				'<time>' + 
				timeAdd(schHour, schedule[i].add) +
				'</time><div class="data"><div class="connections sz-' + 
				(data.station[schedule[i].id].connections.length - 1) + '">' +
				loadConnections(schedule[i].id, routeName) + 
				'</div></div>' + '</span></li>';
		}
		break;
	}
	
	var newHours = new Array();
	switch (routeData.consistent) {
	case "yes":
		newHours = routeData.hours;
		break;
	case "hour":
		for (var u = 0; u < routeData.hours.length; u++) {
			if (routeData[direction][routeData.hours[u].toString()] != null) {
				newHours.push(routeData.hours[u]);
			}
		}
		break;
	case "day":
		for (var u = 0; u < routeData.hours.length; u++) {
			if (routeData[direction][routeData.hours[u].toString()] != null) {
				newHours.push(routeData.hours[u]);
			}
		}
		break;
	}
	
	for (var m = 0; m < newHours.length; m++) {
		switch (routeData.consistent) {
		case "yes":
			document.querySelector(".times select").innerHTML += '<option value="' + 
				newHours[m] + '">' +
				timeAdd(newHours[m], routeData[direction][0].add) + ' - ' + 
				timeAdd(newHours[m], routeData[direction][routeData[direction].length - 1].add) + '</option>';
			break;
		case "hour":
			document.querySelector(".times select").innerHTML += '<option value="' + 
				newHours[m] + '">' +
				timeAdd(newHours[m], routeData[direction][schHour.toString()][1].add) + ' - ' + 
				timeAdd(newHours[m], routeData[direction][schHour.toString()][routeData[direction][schHour.toString()].length - 1].add) + '</option>';
			break;
		case "day":
			document.querySelector(".times select").innerHTML += '<option value="' + 
				newHours[m] + '">' +
				timeAdd(newHours[m], routeData[direction][prop][0].add) + ' - ' + 
				timeAdd(newHours[m], routeData[direction][prop][routeData[direction][prop].length - 1].add) + '</option>';
			break;
		case "both":
			document.querySelector(".times select").innerHTML += '<option value="' + 
				newHours[m] + '">' +
				timeAdd(newHours[m], routeData[direction][prop][schHour.toString()][0].add) + ' - ' + 
				timeAdd(newHours[m], routeData[direction][prop][schHour.toString()][routeData[direction][prop][schHour.toString()].length - 1].add) + 
				'</option>';
			break;
		}
	}
	
	if (direction === "dir") {
		document.getElementById("switch").className = "hide";
		document.querySelector(".times").className = "hide";
	}
	
	selectLoad();
	loadMap();
}

function switchDir() {
	if (data.route[getQueryVariable("name")].dir !== null) {
		carryQuery = "?name=" + getQueryVariable("name");
		if (getQueryVariable("time") != false) {
			carryQuery += "&time=" + getQueryVariable("time");
		}
		
		if (getQueryVariable("dir") === "in") {
			carryQuery += "&dir=out";
		} else if (getQueryVariable("dir") === "out") {
			carryQuery += "&dir=in";
		} else {
			carryQuery += "&dir=out";
		}
		
		window.location = "../route" + carryQuery;
	} else {
		return;
	}
}

function selectChange() {
	var selecter = document.querySelector(".times select");
	
	carryQuery = "?name=" + getQueryVariable("name");
	carryQuery += "&time=" + selecter.options[selecter.selectedIndex].value;
	if (getQueryVariable("dir") != false) {
		carryQuery += "&dir=" + getQueryVariable("dir");
	}
	
	window.location = "../route" + carryQuery;
}
function selectLoad() {
	var queryTime = getQueryVariable("time");
	if (queryTime != false) {
		var oIndex = document.querySelector(".times select option[value='" + queryTime + "']").index;
		document.querySelector(".times select").options[oIndex].selected = true;
	} else {
		document.querySelector(".times select").options[0].selected = true;
	}
}

document.getElementById("switch").addEventListener("click", switchDir);
document.querySelector(".times select").addEventListener("change", selectChange);

function loadMap() {
	var routeName = getQueryVariable("name");
	var direction = getQueryVariable("dir");
	
	if (!direction) {
		direction = "in";
	}
	
	if (data.route[routeName].dir != null) {
		direction = "dir";
	}
	
	var markers = new Array();
	switch (data.route[routeName].consistent) {
	case "yes":
		for (var n = 0; n < data.route[routeName][direction].length; n++) {
			var pushObject = data.station[data.route[routeName][direction][n].id];
			pushObject["id"] = data.route[routeName][direction][n].id;
			markers.push(pushObject);
		}
		break;
	case "hour":
		for (var n = 1; n < data.route[routeName][direction][schHour.toString()].length; n++) {
			var pushObject = data.station[data.route[routeName][direction][schHour.toString()][n].id];
			pushObject["id"] = data.route[routeName][direction][schHour.toString()][n].id;
			markers.push(pushObject);
		}
		break;
	case "day":
		for (var n = 0; n < data.route[routeName][direction][prop].length; n++) {
			var pushObject = data.station[data.route[routeName][direction][prop][n].id];
			pushObject["id"] = data.route[routeName][direction][prop][n].id;
			markers.push(pushObject);
		}
		break;
	case "both": 
		for (var n = 0; n < data.route[routeName][direction][prop][schHour.toString()].length; n++) {
			var pushObject = data.station[data.route[routeName][direction][prop][schHour.toString()][n].id];
			pushObject["id"] = data.route[routeName][direction][prop][schHour.toString()][n].id;
			markers.push(pushObject);
		}
		break;
	}
	
	var mapOptions = {
		center: new google.maps.LatLng(markers[0].lat, markers[0].lng),
		scrollwheel: false,
		zoom: 10
	}
	var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var lat_lng = new Array();
    var latlngbounds = new google.maps.LatLngBounds();
	var infoWindow = new google.maps.InfoWindow();
	for (var p = 0; p < markers.length; p++) {
		var myLatlng = new google.maps.LatLng(markers[p].lat, markers[p].lng);
		lat_lng.push(myLatlng);
		var marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			title: markers[p].id
		});
		google.maps.event.addListener(marker, "click", function() {
			infoWindow.setContent('<a class="h2 ' + routeName + 
			'" href="../stop/?id=' + this.title +'">' + 
			data.station[this.title].name + '</a><div class="connect">' + 
			loadConnections(this.title, routeName, true) + '</div>');
			infoWindow.open(map, this);
		});
		latlngbounds.extend(marker.position);
	}
	map.setCenter(latlngbounds.getCenter());
	map.fitBounds(latlngbounds);
}