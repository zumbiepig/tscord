import type { FormattersInitializer } from 'typesafe-i18n';

import type { Formatters, Locales } from './i18n-types';

export const initFormatters: FormattersInitializer<Locales, Formatters> = (
	_locale: Locales,
) => {
	return {
		// add your formatter functions here
	} as Formatters;
};
