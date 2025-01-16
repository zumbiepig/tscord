import * as i18nUtilAsync from './i18n-util.async';

// do not export async loadFormatters
const { loadFormatters, ...restI18nUtilAsync } = i18nUtilAsync;

export * from './formatters';
export * from './i18n-node';
export * from './i18n-types';
export { restI18nUtilAsync };
export * from './i18n-util.sync';
export * from './i18n-util';
export * from './localeDetector';
