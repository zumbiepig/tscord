import { rmdir } from 'node:fs/promises';
import { join } from 'node:path';

import { type AnyEntity, type EntityClass } from '@mikro-orm/core';
import { glob } from 'glob';
import {
	type ImportLocaleMapping,
	storeTranslationsToDisk,
} from 'typesafe-i18n/importer';

import { type Locales, locales as i18nLocales, type Translation } from '@/i18n';
import { BaseController, Plugin } from '@/utils/classes';
import { Service } from '@/utils/decorators';

@Service()
export class PluginsManager {
	private _plugins: Plugin[] = [];

	async loadPlugins(): Promise<void> {
		const pluginPaths = await glob(join('src', 'plugins', '*'), {
			windowsPathsNoEscape: true,
		});

		for (const path of pluginPaths) {
			const plugin = new Plugin(path);
			if (await plugin.load()) this._plugins.push(plugin);
		}
	}

	getEntities(): EntityClass<AnyEntity>[] {
		return this._plugins.map((plugin) => Object.values(plugin.entities)).flat();
	}

	getControllers(): (typeof BaseController)[] {
		return this._plugins
			.map((plugin) => Object.values(plugin.controllers))
			.flat();
	}

	async importCommands(): Promise<void> {
		for (const plugin of this._plugins) await plugin.importCommands();
	}

	async importEvents(): Promise<void> {
		for (const plugin of this._plugins) await plugin.importEvents();
	}

	initServices(): Record<string, unknown> {
		const services: Record<string, unknown> = {};

		for (const plugin of this._plugins) {
			for (const service in plugin.services)
				services[service] = new (plugin.services[
					service
				] as new () => unknown)();
		}

		return services;
	}

	async execMains(): Promise<void> {
		for (const plugin of this._plugins) await plugin.execMain();
	}

	async syncTranslations(): Promise<void> {
		const localeMapping: ImportLocaleMapping[] = [];
		const namespaces: Record<string, string[]> = {};
		const translations: Record<string, Translation> = {};

		for (const plugin of this._plugins) {
			for (const locale in plugin.translations) {
				translations[locale] ??= {} as Translation;
				namespaces[locale] ??= [];

				Object.assign(translations[locale], {
					[plugin.name]: plugin.translations[locale as Locales],
				});
				namespaces[locale].push(plugin.name);
			}
		}

		for (const locale in translations) {
			if (i18nLocales.includes(locale as Locales)) {
				localeMapping.push({
					locale,
					translations: translations[locale] ?? {},
					namespaces: namespaces[locale] ?? [],
				});
			}
		}

		const pluginNames = this._plugins.map((plugin) => plugin.name);
		for (const locale of i18nLocales) {
			for (const path of await glob(
				join('src', 'i18n', locale, '*', 'index.ts'),
				{ windowsPathsNoEscape: true },
			)) {
				const name = new RegExp(
					join('src', 'i18n', locale, '(.+)', 'index.ts$'),
				).exec(path)?.[1];
				if (name && !pluginNames.includes(name))
					await rmdir(join('src', 'i18n', locale, name));
			}
		}

		await storeTranslationsToDisk(localeMapping, true);
	}

	isPluginLoad(pluginName: string): boolean {
		return (
			this._plugins.findIndex((plugin) => plugin.name === pluginName) !== -1
		);
	}

	get plugins() {
		return this._plugins;
	}
}
