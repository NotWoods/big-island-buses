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

var jsonUrl = "data.json";
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
}

function locate(latitude, longitude) {
	var value = new google.maps.LatLng(latitude, longitude);
	var closestStop = -1;
	var closestDistance = Number.MAX_VALUE;
	for (var i in data.station) {
		latLngTest = new google.maps.LatLng(data.station[i].lat,data.station[i].lng);
		var distance = google.maps.geometry.spherical.computeDistanceBetween(latLngTest, value);
		if (distance < closestDistance) {
			closestMarker = i;
			closestDistance = distance;
		}
	}
	
	window.location = "/heleon/stop?id=" + closestMarker + 
		"&lat=" + latitude + "&lng=" + longitude;
}

document.getElementById("near-me").addEventListener("click", findUser, false);
document.getElementById("submit").addEventListener("click", findAddress, false);
document.getElementById("place").addEventListener("keydown", function(e) {
	if (event.which == 13 || event.keyCode == 13) {
		findAddress();
		return false;
	}
	return true;
}, false);

function findUser() {
	console.log("finding user");
	navigator.geolocation.getCurrentPosition(function(user) {
		locate(user.coords.latitude, user.coords.longitude);
	});
}

function findAddress() {
	address = document.getElementById("place").value;
	
	var gReq = new XMLHttpRequest();
	gReq.addEventListener("load", function() {
		var result = JSON.parse(gReq.response);
		locate(result.results[0].geometry.location.lat, result.results[0].geometry.location.lng);
	}, false);
	var geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
		address  + "&sensor=false&key=AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI" + 
		"&bounds=20.3583078,-156.2217737|18.7069037,-154.6397426";
	gReq.open("GET", geocodeUrl);
	gReq.send();
}