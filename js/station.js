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
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

var jsonUrl = "http://tigeroakes.com/heleon/data.json";
var data;

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
	loadStation();
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
	loadStation();
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
	loadStation();
}

function loadConnections(stationId, routeName, displayTitle) {
	if (data.station[stationId].connections != null) {
		var connect;
		if (routeName == false || routeName == null) {
			connect = data.station[stationId].connections;
		} else {
			// Remove the current route and leave the others
			var index = data.station[stationId].connections.indexOf(routeName);
			data.station[stationId].connections.splice(index, 1);
			connect = data.station[stationId].connections;
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
						returnThis += 'and "' + data.route[connect[0]].name + '"';
					} else {
						returnThis += '"' + data.route[connect[0]].name + '", ';
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

function loadStation() {
	var id = getQueryVariable("id");
	var stationData = data.station[id];
	
	if (!id) {
		window.location = "http://www.tigeroakes.com/heleon";
		return;
	}
	
	document.getElementById("station-heading").innerHTML = stationData.name;
	
	var list = document.getElementsByClassName("connect")[0]; 
	
	if (stationData.connections != null) {
		list.innerHTML += loadConnections(id, false, true);
	}
	
	loadMap();
	
	var address = new XMLHttpRequest();
	address.addEventListener("load", function() {
		var formatted = JSON.parse(address.response).results;
		document.getElementById("address").innerHTML = formatted[0].formatted_address;
	}, false);
	var geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
		stationData.lat + "," + stationData.lng + "&sensor=false&key=" +
		"AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI";
	address.open("GET", geocodeUrl);
	address.send();
}

function loadMap() {
	var id = getQueryVariable("id");
	var pos = new google.maps.LatLng(data.station[id].lat,data.station[id].lng);
	
	var mapOptions = {
		center: pos,
		scrollwheel: false,
		zoom: 16
	};
	var map = new google.maps.Map(document.getElementById("map"), mapOptions);
	var panoramaOptions = {
		position: pos,
		scrollwheel: false,
		pov: {
			heading: 34,
			pitch: 0
		}
	};
	var panorama = new google.maps.StreetViewPanorama(document.getElementById("streetview"), panoramaOptions);
	map.setStreetView(panorama);
}