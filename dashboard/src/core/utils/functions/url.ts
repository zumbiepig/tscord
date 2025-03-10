export const getAbsoluteUrl = (url: string) => {
	if (url.startsWith('http')) return url;

	return globalThis.window === undefined ? `${process.env.BASE_URL}/${url}` : `${globalThis.location.origin}/${url}`;
};
