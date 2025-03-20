/**
 * Split an array into chunks of a given size
 * @param array The array to split
 * @param chunkSize The size of each chunk (default to 2)
 */
export function chunkArray<T>(array: T[], chunkSize = 2): T[][] {
	const arr: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) arr.push(array.slice(i, i + chunkSize));
	return arr;
}
