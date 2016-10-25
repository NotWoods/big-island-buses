import idb from 'idb';
import upgrade, { GTFS_VERSION } from './upgrade.js';

/**
 * Uses ReadableStream from fetch to parse JSON as it comes in and slowly
 * add it to the database.
 * @param {string} storeName of an ObjectStore
 * @param {string} url to load data from
 * @param {Promise<DB>} [dbOpener] - a promise that resolves with the IndexedDB
 * database. If not provided, one will be opened automactially and closed afterwards.
 * @returns {Promise<void>}
 */
export function streamApiFile(storeName, url, dbOpener) {
	const dbPromise = dbOpener || idb.open('gtfs', GTFS_VERSION, upgrade);

	return fetch(url).then((response) => {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let partialBuffer = '';
		let justStarted = true;

		async function parse() {
			const result = await reader.read();
			partialBuffer += decoder.decode(result.value || new Uint8Array, {
				stream: !result.done,
			});

			if (justStarted) {
				if (partialBuffer.charAt(0) !== '[') throw new SyntaxError(
					`First character should '[', not ${partialBuffer.charAt(0)}`
				);
				partialBuffer = partialBuffer.slice(1);
				justStarted = false;
			}

			const openerCount = partialBuffer.match(/\{/g).length;
			const closerCount = partialBuffer.match(/\}/g).length;

			if (openerCount === closerCount) {
				const lastCloser = partialBuffer.lastIndexOf('}') + 1;
				const json = JSON.parse(`[${partialBuffer.slice(0, lastCloser)}]`);
				partialBuffer = partialBuffer.slice(lastCloser + 1);

				const tx = (await dbPromise).transaction(storeName, 'readwrite');
				json.forEach(item => tx.objectStore(storeName).add(item));
				await tx.complete;
			}

			return parse();
		}

		return parse();
	}).then(() => {
		if (!dbOpener) dbPromise.then(db => db.close());
	})
}

/**
 * Parses a data file using the fetch api then adds all its items
 * to the objectStore with the given name.
 * @param {string} storeName of an ObjectStore
 * @param {string} url to load data from
 * @param {Promise<DB>} [dbOpener] - a promise that resolves with the IndexedDB
 * database. If not provided, one will be opened automactially and closed afterwards.
 * @returns {Promise<void>}
 */
export async function bulkAddApiFile(storeName, url, dbOpener) {
	const data = await (await fetch(url)).json();
	if (!Array.isArray(data)) throw new SyntaxError('Data must be an array');

	const db = await (dbOpener || idb.open('gtfs', GTFS_VERSION, upgrade));
	const tx = db.transaction(storeName, 'readwrite');
	data.map(item => tx.add(item));

	await tx.complete;
	if (!dbOpener) db.close();
}

/**
 * Parses a data file using fetch api. If streams are enabled, then data will
 * be streamed in rather than buffering the entire JSON array first.
 * @param {string} storeName of an ObjectStore
 * @param {string} url to load data from
 * @param {Promise<DB>} [dbOpener] - a promise that resolves with the IndexedDB
 * database. If not provided, one will be opened automactially and closed afterwards.
 * @returns {Promise<void>}
 */
export default function syncApiFile(storeName, url, dbOpener) {
	const func = (typeof ReadableStream === 'undefined')
		? bulkAddApiFile
		: streamApiFile
	return func.call(undefined, storeName, url, dbOpener);
}
