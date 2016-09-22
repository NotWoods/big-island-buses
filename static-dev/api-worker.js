self.addEventListener("message", function(e) {
	openDatabase.then(function() {
		switch (e.data.type) {
			case "stops_list": pushStopsList(); break;
			case "shapes": pushShape(e.data.key); break;
			case "locate_stop": locateStop(e.data.location, e.data.sensor); break;
			default: pushData(e.data.type, e.data.key); break;
		}
	});
}, false);
var worker = self;

function getApi(path, responseType) {
	return new Promise(function(resolve, reject) {
		var rq = new XMLHttpRequest();
		rq.onload = function() {resolve(this.response)}
		rq.onerror = function() {reject()}
		rq.open("GET", path, true);
		rq.responseType = responseType || "json";
		rq.send();
	});
}

const DB_V = 4;
const DB_NAME = "goride";

var db;
function openDatabase() {
	return new Promise(function(resolve, reject) {
		var req = indexedDB.open(DB_NAME, DB_V);
		req.onsuccess = function(e) {db = this.result; resolve();}
		req.onerror = function(e) {reject(e.target.errorCode);}

		req.onupgradeneeded = function(e) {
			var r = e.currentTarget.result;
			var store = r.createObjectStore("goride", {keyPath: "_id"});
			store.createIndex("type", {unique: false});
		}
	});
}

function update() {
	return new Promise(function(resolve, reject) {
		var api = getApi("/api.json");
		var store = db.transaction("goride", "readwrite").objectStore("goride");
		store.openCursor().onsuccess = function(e) {
			api.then(function(newData) {
				var cursor = e.target.result;
				if (cursor) {
					if (newData[cursor.key]) {
						store.put(newData[cursor.key]);
					} else {
						store.delete(cursor.key);
					}
					cursor.continue();
				} else {
					resolve();
				}
			});
		}
	});
}

function pushData(type, id) {
	var rq = db.transaction("goride").objectStore("goride").get(id);
	rq.onerror = function(e) {reject(e.target.errorCode)}
	rq.onsuccess = function(e) {
		worker.postMessage(this.result);
	}
}

function pushStopsList() {
	var index = db.transaction("stops").objectStore("stops").index("type");
	index.openCursor(IDBKeyRange.only("stops")).onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			var message = cursor.value;
			message.type = "stops_list";
			worker.postMessage(message);
		} else {
			worker.postMessage({type: "stops_list_complete"})
		}
	}
}

function pushAllRoutes() {
	var index = db.transaction("stops").objectStore("stops").index("type");
	var output = {};
	output.type = "routes_list";
	index.openCursor(IDBKeyRange.only("routes")).onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			output[cursor.value._id] = cursor.value;
		} else {
			worker.postMessage(output);
		}
	}
}

function pushShape(shape_id) {
	var rq = new XMLHttpRequest();
	rq.onload = function() {
		worker.postMessage(this.response);
	}
	rq.open("GET", "/shape/id.json", true);
	rq.responseType = responseType || "json";
	rq.send();
}

Math.hypot = Math.hypot || function(x,y){return Math.sqrt(x*x, y*y)}

function locateStop(location, fromSensor) {
	var index = db.transaction("stops").objectStore("stops").index("type");
	var closestStop, closestDist = Infinity;
	index.openCursor(IDBKeyRange.only("stops")).onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			var distance = Math.hypot(location.lat - cursor.value.location.lat, location.lng - cursor.value.location.lng);
			if (distance < closestDist) closestStop = cursor.value;
		} else {
			if (fromSensor) {
				worker.postMessage({type: "locate_stop", data: closestStop});
			} else {
				worker.postMessage(closestStop);
			}
		}
	}
}

openDatabase.then(function() {getApi("/version")}).then(update);