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

/**
 * Streams in a ZIP file and converts its CSV contents to JSON files in the
 * provided directory.
 * @param {ReadableStream} inStream
 * @param {string} outputDir
 * @returns {Promise<void>} resolves when completed
 */
module.exports = function extractGTFS(inStream, outputDir) {
	if (!inStream || !outputDir) {
		throw new TypeError('Missing parameter');
	}

	return new Promise((resolve, reject) => {
		const outputStreams = [];

		mkdirp(outputDir, (err) => {
			if (err) throw reject(err);

			inStream
			.pipe(new Parse())
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
						toArrayString: true,
					}))
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
	module.exports(createReadStream(zipPath), outputDir);
}
