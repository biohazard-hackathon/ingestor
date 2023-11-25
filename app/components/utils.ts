/**
 * Simple object check.
 */
export function isObject<T>(item: T): boolean {
	return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeDeep<T>(target: any, ...sources: Array<T>): Record<string, unknown> { // eslint-disable-line @typescript-eslint/no-explicit-any
	if (!sources.length) {
		return target;
	}

	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) {
					Object.assign(target, {[key]: {}});
				}
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {[key]: source[key]});
			}
		}
	}

	return mergeDeep(target, ...sources);
}
