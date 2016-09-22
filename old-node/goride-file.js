var JSZip = require('jszip'),
    fs = require('fs'),
    oboe = require('oboe'),
    /*githubhook = require('githubhook'),
    github = githubhook({secret:'tqLM83ZHtSc2DL7z'}),
    exec = require('child_process').exec,*/
    Converter = require('csvtojson').core.Converter;
    require('es6-promise').polyfill();

function iB(i) {return parseInt(i,10)!==0?true:false;}

function parseScheduleSource() {
	function GTFSData() { this.routes = {}; this.stops = {}; this.calendar = {}; }
	var variable = new GTFSData();

	readRq = new Promise(function(readResolve, readReject) {
		fs.readdir(__dirname + "/hawaii-gtfs/", function(err, files) {
			var fileList = files.filter(function(element) {return element.indexOf(".txt") > -1;}),
			zip = new JSZip();
			Promise.all(fileList.map(function(fileName) {
				return new Promise(function(jsonResolve, jsonReject) {
					var c2jPromise = new Promise(function(c2jRslv, csjRjct) {
						var csvStream = fs.createReadStream(__dirname + "/hawaii-gtfs/"	 + fileName);
						var csvConverter = new Converter({});
	
						csvConverter.on("end_parsed", function(jsonObj) {
							c2jRslv({
								name: fileName.substring(0, fileName.length - 4), 
								body: jsonObj
							});
						});
						csvStream.pipe(csvConverter);
					}), zipPromise = new Promise(function(zipRslv, zipRjct) {
						var zipStream = fs.createReadStream(__dirname + "/hawaii-gtfs/"  + fileName), zipFile = [];
						zipStream.on("data", function(chunk) {
							zipFile.push(chunk);
						}).on("end", function() {
							zip.file(fileName, zipFile.join(""));
							zipRslv(true);
						});
					});
					Promise.all([c2jPromise, zipPromise]).then(function(rslt) {
						jsonResolve(rslt[0]);
					});
				});
			})).then(function(result) {
				var buffer = zip.generate({type:"nodebuffer"});
				fs.writeFile(__dirname + "/google_transit.zip", buffer, function(err) {});
				readResolve(result);
			});
		});
	});

	readRq.then(function(jsonFiles) {
		var json = {};//, shapeFilePromise;
		for (var h = 0; h < jsonFiles.length; h++) {
			/*if (jsonFiles[h].name == "shapes") {
				shapeFilePromise = new Promise(function(shpRes, shpRej) {
					fs.writeFile(__dirname + '/shapes.json', JSON.stringify(jsonFiles[h].body), function(err) {
						if (err) {console.error(err); shpRej(err);} else {shpRes();}
					});
				});
			} else {json[jsonFiles[h].name] = jsonFiles[h].body;}*/
			json[jsonFiles[h].name] = jsonFiles[h].body;
		}
		for (var r = 0; r < json.routes.length; r++) {
			var tr = json.routes[r], vr = variable.routes;
			vr[tr.route_id] = tr; vr[tr.route_id].trips = {};
		}
		//var shapeIndex = {};
		for (var t = 0; t < json.trips.length; t++) {
			var tt = json.trips[t], vt = variable.routes[tt.route_id].trips;
			vt[tt.trip_id] = tt; vt[tt.trip_id].stop_times = {};
			//shapeIndex[tt.shape_id] = tt.route_id;
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
					else {vc[tc.service_id].text_name = [reference[firstDay], " - ", reference[lastDay]].join('');}
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
		fs.writeFile(__dirname + '/output.json', JSON.stringify(variable), function(err) {
			if (err) console.error(err);
		});

		/*shapeFilePromise.then(function() {
			var shapeVar = {};
			oboe('shapes.json').node("!.*", function(tshp) {
				if (shapeIndex[tshp.shape_id]) {
					if (!shapeVar[shapeIndex[tshp.shape_id]]) shapeVar[shapeIndex[tshp.shape_id]] = {};
					if (!shapeVar[shapeIndex[tshp.shape_id]][tshp.shape_id]) {
						shapeVar[shapeIndex[tshp.shape_id]][tshp.shape_id] = [];}
					shapeVar[shapeIndex[tshp.shape_id]][tshp.shape_id][tshp.shape_pt_sequence] = {
						lat: tshp.shape_pt_lat,
						lng: tshp.shape_pt_lon
					}
				}
				return oboe.drop;
			}).done(function() {
				for (var route in shapeVar) {
					for (var shape in shapeVar[route]) {
						for (var i = 0; i < shapeVar[route][shape].length; i++) {
							if (!shapeVar[route][shape][i]) {
								shapeVar[route][shape].splice(i, 1);
								i--;
							}
						}
					}
					fs.writeFile(__dirname+'/shapes/'+route+'.json', JSON.stringify(shapeVar[route]), function(err) {
						if (err) console.error(err); else console.log("shapes for route "+route+" done!");
					});
				}
			})
		})*/

		/*var shapeVar = {};
		for (var shp = 0; shp < json.shapes.length; shp++) {
			var tshp = json.shapes[shp];
			if (!shapeVar[tshp.shape_id]) {shapeVar[tshp.shape_id] = [];}
			shapeVar[tshp.shape_id][tshp.shape_pt_sequence] = {
				lat: tshp.shape_pt_lat,
				lng: tshp.shape_pt_lon
			};
		}
		var routeShapes = {};
		for (var key in shapeVar) {
			var thisShape = shapeVar[key];
			var shapeRoute;
			if (!shapeIndex[key]) {break;} else {
				shapeRoute = shapeIndex[key];
				if (!routeShapes[shapeRoute]) {routeShapes[shapeRoute] = {};}
				if (!routeShapes[shapeRoute][key]) {routeShapes[shapeRoute][key] = [];}
			}
			for (var i = 0; i < thisShape.length; i++) {
				if (thisShape[i]) {
					routeShapes[shapeRoute][key].push(thisShape[i]);
				}
			}
		}
		for (var routeKey in routeShapes) {
			fs.writeFile(__dirname+'/shapes/'+routeKey+'.json', JSON.stringify(routeShapes[routeKey]), function(err) {
				if (err) console.error(err);
			});
		}*/
	});
}

parseScheduleSource();
fs.watch(__dirname + "/hawaii-gtfs", {}, function(e, f) {
	if (f !== null && f.indexOf(".txt") == f.length - 4) {
		console.log("%s has been updated, generating new files", f);
		parseScheduleSource();
	}
});

/*github.listen();
github.on('push:hawaii-gtfs', function(event, repo, ref, data) {
	///srv/goride/hook.sh
	exec('git pull', {cwd: '/srv/goride/hawaii-gtfs'}, function(err, stdout, stderr) {
		console.log(stdout);
		console.log("git repo pulled");
	});
});*/