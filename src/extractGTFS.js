import { createReadStream, createWriteStream } from 'fs';
import { join, extname } from 'path';
import { Parse } from 'unzip';
import { Converter } from 'csvtojson';

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

/**
 * Streams in a ZIP file and converts its CSV contents to JSON files in the
 * provided directory.
 * @param {string} zipPath
 * @param {string} outputDir
 * @returns {Promise<void>} resolves when completed
 */
export default function extractGTFS(zipPath, outputDir) {
	return new Promise((resolve, reject) => {
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

				const output = promisePipe(entry, join(outputDir, entry.path));
				outputStreams.push(output);
			});

		Promise.all(outputStreams).then(resolve, rejectAndEnd);
	});
}
