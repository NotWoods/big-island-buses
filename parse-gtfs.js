/// <reference path="typings/node/node.d.ts"/>
var MongoClient = require("mongodb").MongoClient,
    csv = require("csv"),
    lazystream = require("lazystream"),
    fs = require("fs"),
		EventEmitter = require('events').EventEmitter,
		MongoWritableStream = require('mongo-writable-stream'),
    Vibrant = require('node-vibrant');

var status = new EventEmitter();

function stringToDate(str) {
	if (str == null || str.length != 8) return;
	
	if (str.indexOf(":") > -1) {
		var timeArray = str.split(":").map(parseInt), extraDays = 0, extraHours = 0;
		var hr = timeArray[0], min = timeArray[1], sec = timeArray[2];
		
		if (hr > 23) {
			extraDays = Math.floor(hr / 24);
			extraHours = hr % 24;
		}
		
		return new Date(0, 0, extraDays, hr+extraHours, min, sec, 0);
	} else {
		return new Date(
			str.substring(0,3),
			str.substring(4,5),
			str.substring(6,7),
			0, 0, 0, 0
		);
	}
}

function writeFile(path) {
	return new lazystream.Writeable(function() {
		return fs.createWriteStream(path);
	}).on("error", function(err) {console.error(err)})
}

function readFile(path) {
	return new lazystream.Readable(function() {
		return fs.createReadStream(path);
	}).on("error", function(err) {console.error(err)})
}

function storeData(filename, folder, mongoUrl) {
	function alterRecord(record) {
		switch(filename) {
			case "calendar.txt": 
				var calName = "";
				switch(record.service_id) {
					case "FULLW": calName = "Daily"; break;
					case "WE": calName = "Saturday - Sunday"; break;
					case "NOSUN": calName = "Monday - Saturday"; break;
					case "WD": calName = "Monday - Friday"; break;
					case "SAT": calName = "Saturday"; break;
					case "NOHOLIDAY": calName = "Daily"; break;
					case "SCHOOL": calName = "Daily (During School)"; break;
					case "MWF": calName = "Monday, Wednesday, & Friday"; break;
					case "TTS": calName = "Tuesday, Thursday, & Saturday"; break;
				};
				return {
					type: "calendar",
					_id: record.service_id,
					exceptions: [],
					days: [
						!!record.sunday,
						!!record.monday,
						!!record.tuesday,
						!!record.wednesday,
						!!record.thursday,
						!!record.friday,
						!!record.saturday
					],
					name: calName
				}; break;
			case "calendar_dates.txt": 
				return {
					type: "calendar_dates",
					parent: record.service_id,
					date: stringToDate(record.date),
					exception_type: parseInt(record.exception_type)
				}; break;
			case "routes.txt": 
				return {
					type: "routes",
					_id: record.route_id,
					name: record.route_long_name,
					color: record.route_color,
					text_color: record.route_text_color,
					trips: []
				}; break;
			case "shapes.txt":
				return {
					shape: record.shape_id,
					type: "shapes",
					location: {
						lat: record.shape_pt_lat,
						lng: record.shape_pt_lon
					},
					sequence: record.shape_pt_sequence
				}; break;
			case "stop_times.txt": 
				return {
					type: "stop_times",
					parent: record.stop_id,
					time: stringToDate(record.arrival_time),
					sequence: parseInt(record.stop_sequence)
				}; break;
			case "stops.txt": 
				var stopColor = "", stopText = "";
			
				return {
					type: "stops",
					_id: record.stop_id,
					name: record.stop_name,
					location: {
						lat: record.stop_lat,
						lng: record.stop_lon
					},
					parents: [],
					color: stopColor,
					text_color: stopText
				}; break;
			case "trips.txt": 
				return {
					type: "trips",
					_id: record.route_id,
					name: record.trip_short_name,
					direction_id: parseInt(record.direction_id),
					shape: record.shape_id,
					service: record.service_id,
					headsign: record.trip_headsign,
					schedule: []
				}; break;
		}
	}
	
	return new Promise(function(resolve, reject) {
		var mongoStream = new MongoWritableStream({
			url: mongoUrl, 
			collection: filename.substring(0, filename.lastIndexOf("."))
		})
		
		var s = readFile(folder + filename)
			.pipe(csv.parse({columns:true}))
			.pipe(csv.transform(alterRecord))
			.pipe(mongoStream)
			.on("finish", resolve);
	})
}

module.exports = function(folder, databaseUrl) {
	fs.readFile("currentVersion", {encoding: "utf8"}, function(err, version) {
		var newVersion = new Promise(function(resolve, reject) {
			fs.readFile(folder + "feed_info.txt", function(err, feedInfo) {
				csv.parse(feedInfo, {columns: true}, function(err, output) {
					fs.writeFile("currentVersion", output.feed_version);
					if (err && err.code == "ENOENT") {resolve()}
					else if (parseInt(output.feed_version) > parseInt(version)) {resolve()} 
					else {reject()}
				})
			})
		});
		newVersion.then(function() {
			MongoClient.connect(databaseUrl, function(err, db) {db.dropDatabase(function() {db.close(function() {
				fs.readdir(folder, function(err, files) {
					var promiseList = files.map(function(value, index, array) {
						if (value == "calendar.txt" 
						|| value == "calendar_dates.txt" 
						|| value == "routes.txt" 
						|| value == "stop_times.txt"
						|| value == "stops.txt"
						|| value == "trips.txt") {
							return storeData(value, folder, databaseUrl);
						} //else if (value.includes(".txt")) {}
						return Promise.resolve(null);
					});
					var shapePromise = storeData("shapes.txt", folder, databaseUrl);
		
					Promise.all(promiseList).then(function() {status.emit("upgrade"); status.emit("interactive")});
					shapePromise.then(function() {status.emit("finish")})
			});
			})})});
		}, function() {
			status.emit("interactive");
			status.emit("finish");
		})
	})
	
	
	
	return status;
}