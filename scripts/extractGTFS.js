const { createReadStream, createWriteStream, stat: statCb } = require('fs');
const { join, extname, basename } = require('path');
const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');
const { Parse } = require('unzip');
const { Converter } = require('csvtojson');
const mkdirp = require('mkdirp');

function streamToPromise(stream, endEvent = 'finish') {
  return new Promise((resolve, reject) => {
    stream.on(endEvent, resolve);
  	stream.on('error', reject);
  });
}

class ArrayToObject extends Transform {
  constructor(basename, options) {
    super(options);
		this.decoder = new StringDecoder('utf8');

		switch (basename) {
			case 'agency': case 'stops': case 'routes':	case 'trips':
				this.keypath =
					`${basename.endsWith('s') ? basename.slice(0, -1) : basename}_id`;
				break;

			case 'calendar':
				this.keypath = 'service_id';
				break;

			case 'fare_attributes':
				this.keypath = 'fare_id';
				break;

			case 'frequencies':
				this.keypath = 'trip_id';
				break;

			case 'calendar_dates': case 'transfers': case 'feed_info':
			case 'stop_times': case 'shapes': case 'fare_rules':
			default:
				this.keypath = null;
				break;
		}

		this.first = true;
  }

	_transform(chunk, encoding, done) {
		if (this.first) {
			this.first = false;
			this.push(this.keypath === null ? '[' : '{');
		} else {
			this.push(',');
		}

		if (encoding === 'buffer') chunk = JSON.parse(this.decoder.write(chunk));
		else if (typeof chunk === 'string') chunk = JSON.parse(chunk);

		let output = JSON.stringify(chunk)
		if (this.keypath !== null) {
			output = `${JSON.stringify(chunk[this.keypath])}:${output}`;
		}
		this.push(output);

		done();
	}

	_flush(done) {
		this.push(this.keypath === null ? ']' : '}');
		done();
	}
}

/**
 * Streams in a ZIP file and converts its CSV contents to JSON files in the
 * provided directory.
 * @param {string} zipPath
 * @param {string} outputDir
 * @returns {Promise<void>} resolves when completed
 */
module.exports = function extractGTFS(zipPath, outputDir) {
	if (!zipPath || !outputDir) {
		throw new TypeError('Missing parameter');
	}

	return new Promise((resolve, reject) => {
		const outputStreams = [];

		mkdirp(outputDir, (err) => {
			if (err) throw reject(err);

			createReadStream(zipPath).pipe(new Parse())
			.on('error', (err) => {
				parser.end();
				reject(err);
			})
			.on('entry', (entry) => {
				if (entry.type !== 'File' || extname(entry.path) !== '.txt') {
					entry.autodrain();
					parser.end();
					reject(new TypeError('Invalid GTFS zip file, ' +
						'must not contain directories or non-txt files'));
				}

				const sourceFile = basename(entry.path, '.txt');
				const destPath = join(outputDir, `${sourceFile}.json`);

				const writer = entry
					.pipe(new Converter({
						constructResult: false,
						ignoreEmpty: true,
						flatKeys: true,
					}))
					.pipe(new ArrayToObject(sourceFile))
					.pipe(createWriteStream(destPath));

				outputStreams.push(streamToPromise(writer).catch((err) => {
					parser.end();
					reject(err);
				}));
			})
			.on('finish', () => {
				resolve(Promise.all(outputStreams));
			});
		});
	});
}

if (require.main === module) {
	const [,, zipPath, outputDir] = process.argv;
	module.exports(zipPath, outputDir);
}
