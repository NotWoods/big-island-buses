/// <reference path="typings/node/node.d.ts"/>
var fs = require("fs"),
	csv = require("csv"),
	Vibrant = require('node-vibrant'),
	lazystream = require("lazystream"),
	thenJade = require("then-jade");
	
const SERVER_FOLDER = __dirname; //"/srv/big-island-buses/"
var gtfs = {
	stops: function(record) {
		this._id = record.stop_id;
		this.name = record.stop_name;
		this.location = {
			lat: record.stop_lat,
			lng: record.stop_lon
		};
		this.parents = [];
		this.color = "";
		this.text_color = "";
	},
	routes: function(record) {
		this._id = record.route_id;
		this.name = record.route_long_name;
		this.color = record.route_color;
		this.text_color = record.route_text_color;
		this.trips = [];
	},
	trips: function(record) {
		this._id = record.trip_id;
		this.name = record.trip_short_name;
		this.direction_id = record.direction_id;
		this.shape = record.shape_id;
		this.service = record.service_id;
		this.headsign = record.trip_headsign;
		this.schedule = [];
	},
	stop_times: function(record) {
		this.parent = record.stop_id;
		this.time = record.arrival_time;
		this.sequence = record.stop_sequence;
	},
	shapes: function(record) {
		this.shape = record.shape_id;
		this.sequence = record.shape_pt_sequence;
		this.location = {
			lat: record.shape_pt_lat,
			lng: record.shape_pt_lon
		}
	},
	calendar: function(record) {
		this._id = record.service_id;
		this.exceptions = [];
		this.days = [
			!!record.sunday,
			!!record.monday,
			!!record.tuesday,
			!!record.wednesday,
			!!record.thursday,
			!!record.friday,
			!!record.saturday
		];
		
		switch(record.service_id) {
			case "FULLW": this.name = "Daily"; break;
			case "WE": this.name = "Saturday - Sunday"; break;
			case "NOSUN": this.name = "Monday - Saturday"; break;
			case "WD": this.name = "Monday - Friday"; break;
			case "SAT": this.name = "Saturday"; break;
			case "NOHOLIDAY": this.name = "Daily"; break;
			case "SCHOOL": this.name = "Daily (During School)"; break;
			case "MWF": this.name = "Monday, Wednesday, & Friday"; break;
			case "TTS": this.name = "Tuesday, Thursday, & Saturday"; break;
		}
	},
	calendar_dates: function(record) {
		this.parent = record.service_id;
		this.date = record.date;
		this.exception_type = record.exception_type;
	}
}
gtfs.stops.prototype.text_color = "#fff";
gtfs.trips.prototype.direction_id = "0";
gtfs.calendar.prototype.name = "0";
gtfs.calendar_dates.prototype.exception_type = "2";

gtfs.stops.prototype.types = "stops";
gtfs.routes.prototype.types = "routes";
gtfs.trips.prototype.types = "trips";
gtfs.stop_times.prototype.types = "stop_times";
gtfs.shapes.prototype.types = "shapes";
gtfs.calendar.prototype.types = "calendar";
gtfs.calendar_dates.prototype.types = "calendar_dates";

// Converts the HH:MM:SS stop_times times into JavaScript dates
function stopTimeToDate(timeString) {
	if (timeString === null) return null; // If the input is null, return null
	var timeArr = timeString.split(":"); // Split the time into a [HH, MM, SS] array
	var extraDays = 0, extraHours = 0; // Interator for adding days to the JavaScript date object
	/* If the time represents a trip over multiple days 
	(the time is later than midnight) subtract the extra hours and convert into days */
	if (parseInt(timeArr[0]) > 23) {
		extraDays = Math.floor(parseInt(timeArr[0]) / 24); 
		extraHours = parseInt(timeArr[0]) % 24;
	}
	// Return a date at 0ms + the time specified in the string
	return new Date(0,0,0 + extraDays, parseInt(timeArr[0]) + extraHours,timeArr[1],timeArr[2],0);
}

// Converts the YYYYMMDD calendar strings into JavaScript dates
function calendarStringToDate(dateString) {
	if (dateString === null) return null;
	//Return a date by getting substrings of YYYY MM DD
	return new Date(dateString.substr(0,3), dateString.substr(4,5), dateString.substr(6,7), 0,0,0,0);
}
	
function writeFile(relativePath) {
	return new lazystream.Writeable(function() {
		return fs.createWriteStream(SERVER_FOLDER + "build/" + relativePath);
	}).on("error", function(err) {console.error(err)})
}
function readFile(relativePath) {
	return new lazystream.Readable(function() {
		return fs.createReadStream(SERVER_FOLDER + "src/" + relativePath);
	}).on("error", function(err) {console.error(err)})
}

function transformCSV(file) {
	var schemeType = file.substring(0, file.lastIndexOf("."))
	
	function alterRecord(record) {
		return new gtfs[schemeType](record);
	}
	
	return new Promise(function(resolve, reject) {
		var s = readFile(file)
			.pipe(csv.parse({columns:true}))
			.pipe(csv.transform(alterRecord))
			.pipe(writeFile("api/"+schemeType+".json"))
			.on("finish", resolve);
	})
}