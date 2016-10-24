const { createReadStream, createWriteStream, stat } = require('fs');
const { join, extname } = require('path');
const { Parse } = require('unzip');
const { Converter } = require('csvtojson');

function promisePipe(source, dest) {
	return new Promise((resolve, reject) => {
		const writeStream = createWriteStream(dest);
		writeStream.on('finish', resolve).on('error', reject);

		const conveter = new Converter({
			constructResult: false,
			toArrayString: true,
			ignoreEmpty: true,
			flatKeys: true,
		});

		source.pipe(conveter).pipe(writeStream);
	});
}

function exists(path) {
	return new Promise((resolve, reject) => {
		stat(path, (err, result) => {
			if (err) {
				if (err.code === 'ENOENT') resolve(false);
				else reject(err);
			}

			resolve(true);
		})
	})
}

/**
 * Streams in a ZIP file and converts its CSV contents to JSON files in the
 * provided directory.
 * @param {string} zipPath
 * @param {string} outputDir
 * @returns {Promise<void>} resolves when completed
 */
module.exports = function extractGTFS(zipPath, outputDir) {
	return new Promise((resolve, reject) => {
		if (!zipPath || !outputDir) {
			reject(new TypeError('Missing parameter'));
		}

		const outputStreams = [];
		let foundErr = false;

		function rejectAndEnd(err) {
			reject(err);
			foundErr = true;
		}

		createReadStream(zipPath)
			.pipe(Parse())
			.on('error', rejectAndEnd)
			.on('entry', (entry) => {
				if (entry.type !== 'File' || extname(entry.path) !== '.txt') {
					rejectAndEnd(new TypeError('Invalid GTFS zip file, ' +
						'must not contain directories or non-txt files')
					);
					entry.autodrain();
				}

				if (foundErr) {
					entry.autodrain();
					return;
				}

				const destPath = join(outputDir, `${entry.path.slice(0, -4)}.json`);
				const output = promisePipe(entry, destPath);
				outputStreams.push(output);
			});

		Promise.all(outputStreams).then(resolve, rejectAndEnd);
	});
}

if (require.main === module) {
	const [,, zipPath, outputDir] = process.argv;
	module.exports(zipPath, outputDir);
}
