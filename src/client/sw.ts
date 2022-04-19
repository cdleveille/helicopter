/// <reference lib="WebWorker" />

import { PrecacheEntry } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

const manifest = self.__WB_MANIFEST as PrecacheEntry[];

const cacheName = "swcache_" + new Date().toISOString();

const deleteOldCaches = async () => {
	const keys = await caches.keys();
	return keys.map(async (cache) => {
		if (cache !== cacheName) {
			return await caches.delete(cache);
		}
	});
};

deleteOldCaches();

const cacheFileIdentifier = ".hash.";

const isCacheFirstFile = (url: string): boolean => {
	if (url.includes(cacheFileIdentifier)) return true;
	return false;
};

self.addEventListener("install", (event: ExtendableEvent) => {
	self.skipWaiting();
	event.waitUntil(
		(async () => {
			// add every manifest entry to the cache so offline play is immediately possible without a subsequent page refresh
			const cache = await caches.open(cacheName);

			const urls = ["/"];
			manifest.map((entry) => urls.push(entry.url));
			urls.map(async (url) => await cache.put(url, await fetch(url)));
		})()
	);
});

self.addEventListener("activate", (event: ExtendableEvent) => {
	event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event: FetchEvent) => {
	event.respondWith(
		(async () => {
			if (isCacheFirstFile(event.request.url)) return cacheResponse(event);
			return networkResponse(event);
		})()
	);
});

const networkResponse = async (event: FetchEvent): Promise<Response> => {
	try {
		const networkResponse = await fetch(event.request);
		if (event.request.method === "GET" && !event.request.url.includes("socket.io")) {
			const cache = await caches.open(cacheName);
			await trimCache(event, cache);
			event.waitUntil(await cache.put(event.request, networkResponse.clone()));
		}
		return networkResponse;
	} catch (error) {
		return cacheResponse(event);
	}
};

const cacheResponse = async (event: FetchEvent): Promise<Response> => {
	try {
		const cache = await caches.open(cacheName);
		const cacheResponse = await cache.match(event.request);
		return cacheResponse || networkResponse(event);
	} catch (error) {
		return networkResponse(event);
	}
};

// clean up old versions of files with hashed filenames when a new version is fetched over the network
const trimCache = async (event: FetchEvent, cache: Cache) => {
	if (isCacheFirstFile(event.request.url)) {
		const prefix = event.request.url.split(cacheFileIdentifier)[0];
		(await cache.keys()).map(async (key: Request) => {
			if (key.url.startsWith(prefix)) await cache.delete(key);
		});
	}
};

export type {};
