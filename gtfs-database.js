var mongoose = require("mongoose"),
    csv = require("csv"),
    archiver = require("archiver"),
    lazystream = require("lazystream"),
    fs = require("fs"),
    Vibrant = require('node-vibrant'),
    compressor = require("node-minify"),
    sm = require("sitemap"),
    thenJade = require("then-jade");

mongoose.connect("mongodb://localhost:27017/gtfs");
var db = mongoose.connection;


/* Schemas and Models for Mongoose/MondoDB. 
   Mirrors the GTFS spec, but excludes the 
   frequencies file since I don't use it 
   and it conflicts with the stop times */
var Agency = mongoose.model('Agency', new mongoose.Schema({
	_id: String,
	agency_id:       { type: String, unique: true },
	agency_name:     { type: String, required: true },
	agency_url:      { type: String, required: true },
	agency_timezone: { type: String, required: true },
	agency_lang:     { type: String },
	agency_phone:    { type: String },
	agency_fare_url: { type: String },
}));

var stopSchema = mongoose.Schema({
	_id: String,
	routes: [[{type: String, ref: "Route"}]],
	vibrant_color:       { type: String },
	vibrant_text_color:  { type: String },
	stop_id:             { type: String, required: true, unique: true },
	stop_code:           { type: String },
	stop_name:           { type: String, required: true },
	stop_desc:           { type: String },
	stop_lat:            { type: String, required: true },
	stop_lon:            { type: String, required: true },
	zone_id:             { type: String },
	stop_url:            { type: String },
	location_type:       { type: Number, min: 0, max: 1, default: 0 },
	parent_station:      { type: String },
	stop_timezone:       { type: String },
	wheelchair_boarding: { type: Number, min: 0, max: 2, default: 0 }
});
stopSchema.options.toJSON.transform = function(doc, ret, options) {
	var routeList = [];
	for (var i = 0; i < doc.routes.length; i++) {
		routeList.push(doc.routes._id);
	};

	return {
		_id: doc._id,
		type: "stops",
		name: doc.stop_name,
		location: {
			lat: doc.stop_lat,
			lng: doc.stop_lon
		},
		color: doc.vibrant_color,
		text_color: doc.vibrant_text_color,
		parents: routeList
	};
}
var Stop = mongoose.model('Stop', stopSchema);


var routeSchema = mongoose.Schema({
	_id: String,
	trips: [[{type: String, ref: "Trip"}]],
	start_time: { type: Date },
	end_time:   { type: Date },
	start_stop: { type: String },
	end_stop:   { type: String },
	route_id:         { type: String, required: true, unique: true },
	agency_id:        { type: String },
	route_short_name: { type: String },
	route_long_name:  { type: String },
	route_desc:       { type: String },
	route_type:       { type: Number, required: true, min: 0, max: 7, default: 3 },
	route_url:        { type: String },
	route_color:      { type: String },
	route_text_color: { type: String }
});
routeSchema.options.toJSON.transform = function(doc, ret, options) {
	var tripList = {};
	for (var i = 0; i < doc.trips.length; i++) {
		tripList[doc.trips[i]._id] = doc.trips[i].toJSON();
	}

	return {
		_id: ret._id,
		type: "routes",
		name: ret.route_long_name,
		color: ret.route_color,
		text_color: ret.route_text_color,
		trips: tripList
	}
}
var Route = mongoose.model('Route', routeSchema); 

var tripSchema = mongoose.Schema({
	_id: String,
	stopTimes:             [{type: String, ref: "StopTime"}],
	route_id:              { type: String, required: true },
	service_id:            { type: String, required: true, ref: "Calendar" },
	trip_id:               { type: String, required: true, unique: true },
	trip_headsign:         { type: String },
	trip_short_name:       { type: String },
	direction_id:          { type: Number, min: 0, max: 1 },
	block_id:              { type: String },
	shape_id:              { type: String },
	wheelchair_accessible: { type: Number, min: 0, max: 2, default: 0 },
	bikes_allowed:         { type: Number, min: 0, max: 2, default: 0 }
});
tripSchema.options.toJSON.transform = function(doc, ret, options) {
	var stopTimeList = [];
	for (var i = 0; i < doc.stopTimes.length; i++) {
		stopTimeList[i] = doc.stopTimes[i].toJSON();
	}

	return {
		_id: ret._id,
		type: "trips",
		direction_id: ret.direction_id,
		shape: ret.shape_id,
		service: doc.service_id.toJSON(),
		headsign: ret.trip_headsign,
		name: ret.trip_short_name,
		schedule: stopTimeList
	}
}
var Trip = mongoose.model('Trip', tripSchema);

var stopTimeSchema = mongoose.Schema({
	trip_id:             { type: String, ref: "Trip", index: true },
	arrival_time:        { type: Date, required: true },
	departure_time:      { type: Date, required: true },
	stop_id:             { type: String, ref: "Stop", required: true },
	stop_sequence:       { type: Number, min: 1, required: true, index: true },
	stop_headsign:       { type: String },
	pickup_type:         { type: Number, min: 0, max: 3, default: 0 },
	drop_off_type:       { type: Number, min: 0, max: 3, default: 0 },
	shape_dist_traveled: { type: String },
	timepoint:           { type: Number, min: 0, max: 1 }
}); stopTimeSchema.index({ trip_id: 1, stop_sequence: 1 }, {unique: true});
stopTimeSchema.options.toJSON.transform = function(doc, ret, options) {
	return {
		time: doc.arrival_time.getTime(),
		stop_id: ret.stop_id._id,
		stop_name: ret.stop_id.stop_name
	}
}
var StopTime = mongoose.model("StopTime", stopTimeSchema);

var calendarSchema = mongoose.Schema({
	_id: String,
	exceptions: [{type: String, ref: "CalendarDate"}],
	text_name:  { type: String },
	service_id: { type: String, required: true, unique: true },
	monday:     { type: Number, required: true, min: 0, max: 1 },
	tuesday:    { type: Number, required: true, min: 0, max: 1 },
	wednesday:  { type: Number, required: true, min: 0, max: 1 },
	thursday:   { type: Number, required: true, min: 0, max: 1 },
	friday:     { type: Number, required: true, min: 0, max: 1 },
	saturday:   { type: Number, required: true, min: 0, max: 1 },
	sunday:     { type: Number, required: true, min: 0, max: 1 },
	start_date: { type: Date, required: true },
	end_date:   { type: Date, required: true }
});
calendarSchema.options.toJSON.transform = function(doc, ret, options) {
	var textName = "";
	switch(doc[i].service_id) {
		case "FULLW": textName = "Daily"; break;
		case "WE": textName = "Saturday - Sunday"; break;
		case "NOSUN": textName = "Monday - Saturday"; break;
		case "WD": textName = "Monday - Friday"; break;
		case "SAT": textName = "Saturday"; break;
		case "NOHOLIDAY": textName = "Daily"; break;
		case "SCHOOL": textName = "Daily (During School)"; break;
		case "MWF": textName = "Monday, Wednesday, & Friday"; break;
		case "TTS": textName = "Tuesday, Thursday, & Saturday"; break;
	}

	var exceptionsList = [];
	for (var i = 0; i < doc.exceptions.length; i++) {
		exceptionsList.push({type: doc.exceptions[i].exception_type, date: doc.exceptions[i].date.toDateString()});
	}

	return { 
		_id: ret._id,
		type: "calendar",
		days: [
			!!ret.sunday,
			!!ret.monday,
			!!ret.tuesday,
			!!ret.wednesday,
			!!ret.thursday,
			!!ret.friday,
			!!ret.saturday
		],
		exceptions: exceptionsList,
		name: textName
	};
}
var Calendar = mongoose.model('Calendar', calendarSchema);

var CalendarDate = mongoose.model('CalendarDate', new mongoose.Schema({
	service_id:     { type: String, required: true, index: true },
	date:           { type: Date, required: true },
	exception_type: { type: Number, required: true, min: 1, max: 2 }
}));

var FareAttribute = mongoose.model('FareAttribute', new mongoose.Schema({
	_id: String,
	fare_id:           { type: String, required: true, unique: true },
	price:             { type: String, required: true },
	currency_type:     { type: String, required: true },
	payment_method:    { type: Number, required: true, min: 0, max: 1 },
	transfers:         { type: Number, min: 0, max: 2 },
	transfer_duration: { type: String }
}));

var FareRule = mongoose.model('FareRule', new mongoose.Schema({
	fare_id:        { type: String, required: true, index: true },
	route_id:       { type: String },
	origin_id:      { type: String },
	destination_id: { type: String },
	contains_id:    { type: String }
}));

var shapeSchema = mongoose.Schema({
	shape_id:            { type: String, required: true, index: true },
	shape_pt_lat:        { type: String, required: true },
	shape_pt_lon:        { type: String, required: true },
	shape_pt_sequence:   { type: Number, required: true, index: true },
	shape_dist_traveled: { type: String }
}); shapeSchema.index({ shape_id: 1, shape_pt_sequence: 1 }, {unique: true});
shapeSchema.options.toJSON.transform = function(doc, ret, options) {
	return {
		_id: [doc.shape_id, "-", doc.shape_pt_sequence].join(""),
		shape: doc.shape_id,
		type: "shapes",
		location: {
			lat: doc.shape_pt_lat,
			lng: doc.shape_pt_lon
		}
	}
}
var Shape = mongoose.model("Shape", shapeSchema);

var Transfer = mongoose.model('Transfer', new mongoose.Schema({
	from_stop_id:      { type: String, required: true },
	to_stop_id:        { type: String, required: true },
	transfer_type:     { type: Number, min: 0, max: 3 },
	min_transfer_time: { type: String }
}));

var FeedInfo = mongoose.model('FeedInfo', new mongoose.Schema({
	feed_publisher_name: { type: String, required: true },
	feed_publisher_url:  { type: String, required: true },
	feed_lang:           { type: String, required: true },
	feed_start_date:     { type: Date },
	feed_end_date:       { type: Date },
	feed_version:        { type: Number }
}));

// Creates a relation between the filenames and Models
const MODEL_INDEX = {
	"agency": Agency,
	"stops": Stop,
	"routes": Route,
	"trips": Trip,
	"stop_times": StopTime,
	"calendar": Calendar,
	"calendar_dates": CalendarDate,
	"fare_attributes": FareAttribute,
	"fare_rules": FareRule,
	"shapes": Shape,
	"transfers": Transfer,
	"feed_info": FeedInfo
}

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

function dropDatabase() {
	db.connection.db.dropDatabase();
}

// Parses a GTFS file and saves it to the database with the corresponding Model
function saveCsvToDB(path, filename) {
	function printErr(err) {if (err) {console.error(err.message);}}
	return new Promise(function (resolve, reject) {
		var Model = MODEL_INDEX[filename]; // Finds the correct model type based on the filename
		var parser = csv.parse({columns: true}); // Sets up the csv-parser module
		parser.on("readable", function() { 
			var record;
			while (record = parser.read()) { // record = 1 line from CSV in object form
				let doc = new Model(record); // object keys line up with model keys, so just copy them to database
				/* If a date is involved, convert the string into a date object. 
				   Additionally, assign _ids to each document. */
				switch (filename) { 
					case "agency": 
						doc._id = record.agency_id; break;
					case "calendar":
						doc._id = record.service_id;
						doc.start_date = calendarStringToDate(record.start_date);
						doc.end_date = calendarStringToDate(record.end_date);
						break;
					case "calendar_dates":
						doc.date = calendarStringToDate(record.date);
						break;
					case "fare_attributes": 
						doc._id = record.fare_id; break;
					case "feed_info":
						doc.feed_start_date = calendarStringToDate(record.feed_start_date);
						doc.feed_end_date = calendarStringToDate(record.feed_end_date);
						break;
					case "routes": 
						doc._id = record.route_id; break;
					case "shapes": break; 
					case "stop_times":
						doc.arrival_time = stopTimeToDate(record.arrival_time);
						doc.departure_time = stopTimeToDate(record.departure_time);
						break;
					case "stops": 
						doc._id = record.stop_id; break;
					case "trips": 
						doc._id = record.trio_id; break;
				}
				doc.save(printErr); // Save the file
			}
			resolve();
		});
		parser.on("error", function(err) {
			console.error(err.message);
		});
		
		new lazystream.Readable(function(options) { // Open as a lazystream to avoid too many open files
			return fs.createReadStream(path + filename + ".txt", {encoding: "utf8"});
		}).pipe(parser); // ...and pipe into the csv-parser
	});
}

// Parses a GTFS folder and saves each file to the database
function saveFolderToDB(folderPath) {
	return new Promise(function (resolve, reject) {
		fs.readdir(folderPath, function(err, files) { // List files in the folder
			var fileSavedPromises = [], i = 0;
			for (var file = files.length - 1; file >= 0; file--) {
				/* If the file is a txt file, parse it using the saveCsvToDB function.
				   Otherwise, remove it from the array (i.e.: LICENSE.md) */
				if (files[file].includes(".txt")) {
					fileSavedPromises[i] = saveCsvToDB(folderPath, files[file].substring(0, files[file].lastIndexOf(".")));
					i++;
				} else {
					files.splice(file, 1);
				}
			};
			Promise.all(fileSavedPromises).then(resolve); // Resolve once all the files have been read
		});
	});
}

// Zips up a GTFS folder for Google Maps and public API usage
function zipFolder(folderPath, zipPath) {
	var output = fs.createWriteStream(zipPath);
	var archive = archiver("zip");
	archive.pipe(output); // Pipe the archive stream into the ZIP file write stream
	fs.readdir(folderPath, function(err, files) { // See similar loop in saveFolderToDB
		for (var file = files.length - 1; file >= 0; file--) {
			if (files[file].includes(".txt")) {
				archive.file(folderPath + files[file], {name: files[file]});
			} else {
				files.splice(file, 1);
			}
		}
		archive.finalize();
	}
}

function populateModels() {return new Promise(function(res, rej) {
	var addTripsToRoute = new Promise(function(resolve, reject) {
		var promiseCollection = [];
		Route.find({}, "route_id", function(err, routes) {
			for (var i = 0; i < routes.length; i++) {
				Trip.find({route_id: routes[i]._id}, "trip_id", function(err, trips) {
					for (var j = 0; j < trips.length; j++) {
						StopTime.find({trip_id: trips[j]._id}, "trip_id arrival_time stop_id stop_sequence", {sort: {stop_sequence: 1}}, function(err, stopTimes) {
							for (var k = 0; k < stopTimes.length; k++) {
								Stop.findByIdAndUpdate(stopTimes[k].stop_id, {$addToSet: {routes: routes[i]._id}}, ());
								promiseCollection.push(stopTimes[k].populate("trip_id", "-block_id").populate("stop_id").exec());
								trips[j].stopTimes.push(stopTimes[k]._id);
							};
						});
						promiseCollection.push(trips[j].populate("route_id", "-route_url -route_desc -route_short_name -route_type -agency_id")
							.populate("stopTimes", "-departure_time -timepoint -stop_sequence")
							.populate("service_id", "-_id")
							.exec());
						routes[i].trips.push(trips[j]._id);
					};
					routes[i].save(function(err) {
						promiseCollection.push(routes[i].populate("trips", "-block_id").exec());
					});
				});
			};
		});
		Promise.all(promiseCollection).then(resolve);
	});

	addTripsToRoute.then(function() {
		var promiseCollection = [new Promise(), new Promise()];
		var stopStream = Stop.find().select("routes").stream();
		stopStream.on("data", function(doc) {
			stopSwatch(doc.location).then(function(colors) {
				doc.vibrant_color = colors.vibrant;
				doc.vibrant_text_color = colors.textColor;
			})
			promiseCollection.push(doc.save());
			promiseCollection.push(doc.populate("routes", "-route_url -route_desc -route_short_name -route_type -agency_id"));
		}).on("close", promiseCollection[1].resolve);
		var calStream = CalendarDate.find().stream();
		calStream.on("data", function(date) {
			Calendar.findByIdAndUpdate(date.service_id, {$addToSet: {exceptions: date.service_id}}, ())
		}).on("close", promiseCollection[0].resolve);
		Promise.all(promiseCollection).then(function() {res()})
	});
})}

function generateShapeJson(path, shape) {
	var output = new lazystream.Writeable(function() {return fs.createWriteStream(path)});
	output.write("{" + shape + ":[")

	function transformShape(doc) {
		return {
			lat: doc.shape_pt_lat,
			lng: doc.shape_pt_lon
		}
	}

	var shapeStream = Shape.find({shape_id: shape}).select("-shape_dist_traveled")
		.sort({shape_pt_sequence: 1}).stream({transform: transformShape}), sep = "";
	shapeStream.on("data", function(shapeLine) {
		output.write(sep + JSON.stringify(shapeLine));
		if (!sep) {sep = ",";}
	}).on("close", function() {
		output.end("]}");
	});
}

function stopSwatch(stopLocation) {
	return new Promise(function(resolve, reject) {
		var path = ["https://maps.googleapis.com/maps/api/streetview?size=600x300&key=AIzaSyCb-LGdBsQnw3p_4s-DGf_o2lhLEF03nXI&location="]
		path.push(stopLocation.lat, ",", stopLocation.lng);
		var v = new Vibrant(path.join(""));
		v.getSwatches(function(err, swatches) {
			resolve({vibrant: swatches[0].getHex(), textColor: swatches[0].getTitleTextColor});
		});
	});
}

function mkDir(dirname) {
	return new Promise(function(resolve, reject) {
		fs.mkdir(dirname, function() {
			resolve();
		})
	});
}
function renderFiles() {
	var path = "/srv/big-island-buses/build/"
	var sitemap = sm.createSitemap({
		hostname: "https://goride.io", 
		urls: [
			{url: "/", priority: 1}
		]});
	var routeList = [];

	function compileTemplate() {return new Promise(function(resolve, reject) {
		fs.readFile(path + "index.html", function(err, str) {
			var fn = thenJade.compileStreaming(str);
			resolve(fn);
		})
	})}

	function renderApi() {
		return new Promise(function(res, rej) {
			function apiOutput(doc) {
				apiWriteStream.write(sep + doc);
				if (!sep) {sep = ",";}
			}
			var apiStatus = [new Promise(), new Promise(), new Promise(), new Promise()],
				sep = "",
				apiStreamCalendar = Calendar.find().stream({transform: JSON.stringify}),
				apiStreamRoutes = Route.find().stream({transform: JSON.stringify}),
				apiStreamStops = Stop.find().stream({transform: JSON.stringify}),
				apiStreamTrips = Trip.find().stream({transform: JSON.stringify});
			var apiWriteStream = new lazystream.Writeable(function() {return fs.createWriteStream(path+"api.json")});
			apiWriteStream.write("[");
			apiStreamCalendar.on("data", apiOutput).on("close", function() {apiStatus[0].resolve()});
			apiStreamRoutes.on("data"  , apiOutput).on("close", function() {apiStatus[1].resolve()});
			apiStreamStops.on("data"   , apiOutput).on("close", function() {apiStatus[2].resolve()});
			apiStreamTrips.on("data"   , apiOutput).on("close", function() {apiStatus[3].resolve()});
			Promise.all(apiStatus).then(function() {
				apiWriteStream.end("]");
				res();
			});
		});
	}
	function renderVersion() {return new Promise(function(resolve, reject) {
		FeedInfo.findOne({}, "feed_version", function(err, feedInfo) {
			fs.writeFile(path + "version.txt", feedInfo.feed_version, function(err) {
				resolve();
			});
		})
	})}

	function minifyFiles() {return new Promise(function(resolve, reject) {
		function compress(compressorType, fileName, fileOutput) {return new Promise(function(min, err) {
			if (!fileOutput) fileOutput = "build/" + fileName; fileName = "static-dev/" + fileName;
			new compressor.minify({
				type: compressorType,
				fileIn: fileName,
				fileOut: fileOutput,
				callback: function(e,m) {min()}
			})
		})}

		var compressed = [];
		var jsFiles = ["js/serviceworker-cache-polyfill.js", "js/ui.js", "api-worker.js", "service-worker.js"];
		for (var js = 0; js < jsFiles.length; js++) {
			compressed.push(compress("uglifyjs", jsFiles[js]));
		}
		compressed.push(compress("sqwish", "style.css"));
		Promise.all(compressed).then(resolve);
	})}


	function renderIndex(fn) {return new Promise(function(resolve, reject) {
		var indexOutput = new lazystream.Writeable(function() {return fs.createWriteStream(path+"index.html")});
		Route.find({}, "route_id route_long_name route_color route_text_color", function(err, routes) {
			for (var i = 0; i < routes.length; i++) {
				routeList.push(routes[i]);
			};
			fn({routeList: routeList}).pipe(indexOutput).on("end", function() {resolve(fn)});
		});
	})}
	
	function renderPage(fn, route, trip, stop) {return new Promise(function(resolve, reject) {
		var locals, pagePath = ["s/"], webPath = ["/s/"];
		locals.routeList = routeList;
		if (route) {
			pagePath.push(route.route_id, "/"); webPath.push(route.route_id, "/"); 
			locals.routeInfo = {
				long_name: route.route_long_name, 
				route_color: route.route_color, 
				textColor: route.route_text_color
			};
			locals.routeTrips = {dir0: [], dir1: []};
			for (var i = 0; i < route.trips.length; i++) {
				if (route.trips[i].direction_id == 0) {
					locals.routeTrips.dir0.push(route.trips[i]);
				} else if (route.trips[i].direction_id == 1) {
					locals.routeTrips.dir1.push(route.trips[i]);
				}
			};

			if (trip) {
				pagePath.push(trip.trip_id, "/"); webPath.push(trip.trip_id, "/"); 
				locals.routeInfo.active_trip = trip.trip_id;
				locals.stopTimes = trip.stopTimes;
			}
		}
		if (stop) {
			pagePath.push(stop.stop_id, ".html"); webPath.push("?stop=", stop.stop_id);
			locals.stopInfo = stop;
		} else {pagePath.push("index.html")}

		sitemap.add({url: webPath.join("")});
		var pageOutput = new lazystream.Writeable(function() {return fs.createWriteStream(path+pagePath.join(""))});
		fn(locals).pipe(pageOutput).on("end", resolve);
	})}

	renderVersion().then(renderApi).then(minifyFiles).then(compileTemplate).then(renderIndex).then(function(fn) {
		var stopList = [];
		Stop.find({}, function(err, stops) {
			for (var i = 0; i < stops.length; i++) {stopList.push(stops[i]);};
		});
		var apiStreamRoute = Route.find().stream({});
		apiStreamRoute.on("data", function(doc) {
			renderPage(fn, doc);
			for (var s = 0; s < stopList.length; s++) {renderPage(fn, doc, null, stopList[s])}
			for (var j = 0; j < doc.trips.length; j++) {
				renderPage(fn, doc, doc.trips[j]);
				for (var s = 0; s < stopList.length; s++) {renderPage(fn, doc, doc.trips[j], stopList[s])}
			};
		});
	});
}



saveFolderToDB.then(populateModels).then(function() {
	var shapeStream = Shape.distinct("shape_id").select("shape_id").stream();
	shapeStream.on("data", function(shape) {
		generateShapeJson("shape/"+shape.shape_id+".json", shape.shape_id);
	});
	renderFiles();
	zipFolder();
});