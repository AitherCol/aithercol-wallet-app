export function getCacheItem(key: string) {
	return window.sessionStorage.getItem(`cache:${key}`);
}

export function getCacheItemJSON(key: string) {
	const item = getCacheItem(key);
	return item ? JSON.parse(item) : undefined;
}

export function setCacheItem(key: string, data: string) {
	window.sessionStorage.setItem(`cache:${key}`, data);
}
