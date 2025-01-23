import { rmdir } from 'node:fs/promises';
import { join } from 'node:path';

import { type AnyEntity, type EntityClass } from '@mikro-orm/core';
import { glob } from 'fast-glob';
import {
	type ImportLocaleMapping,
	storeTranslationsToDisk,
} from 'typesafe-i18n/importer';

import { type BaseTranslation, type Locales, locales } from '@/i18n';
import { BaseController, Plugin } from '@/utils/classes';
import { Service } from '@/utils/decorators';

@Service()
export class PluginsManager {
	private _plugins: Plugin[] = [];

	public async loadPlugins(): Promise<void> {
		const pluginPaths = await glob('./src/plugins/*');

		for (const path of pluginPaths) {
			const plugin = new Plugin(path);
			if (await plugin.load()) this._plugins.push(plugin);
		}
	}

	public getEntities(): EntityClass<AnyEntity>[] {
		return this._plugins.map((plugin) => Object.values(plugin.entities)).flat();
	}

	public getControllers(): (typeof BaseController)[] {
		return this._plugins
			.map((plugin) => Object.values(plugin.controllers))
			.flat();
	}

	public async importCommands(): Promise<void> {
		for (const plugin of this._plugins) await plugin.importCommands();
	}

	public async importEvents(): Promise<void> {
		for (const plugin of this._plugins) await plugin.importEvents();
	}

	public initServices(): Record<string, unknown> {
		const services: Record<string, unknown> = {};

		for (const plugin of this._plugins) {
			for (const service in plugin.services)
				services[service] = new (plugin.services[
					service
				] as new () => unknown)();
		}

		return services;
	}

	public async execMains(): Promise<void> {
		for (const plugin of this._plugins) await plugin.execMain();
	}

	public async syncTranslations(): Promise<void> {
		const localeMapping: ImportLocaleMapping[] = [];
		const namespaces: Record<string, string[]> = {};
		const translations: Record<string, BaseTranslation> = {};

		for (const plugin of this._plugins) {
			for (const locale in plugin.translations) {
				translations[locale] ??= {} as BaseTranslation;
				namespaces[locale] ??= [];

				Object.assign(translations[locale], {
					[plugin.name]: plugin.translations[locale as Locales],
				});
				namespaces[locale].push(plugin.name);
			}
		}

		for (const locale in translations) {
			if (locales.includes(locale as Locales)) {
				localeMapping.push({
					locale,
					translations: translations[locale] ?? {},
					namespaces: namespaces[locale] ?? [],
				});
			}
		}

		const pluginNames = this._plugins.map((plugin) => plugin.name);
		for (const locale of locales) {
			for (const path of await glob(join('src', 'i18n', locale, '*', 'index.ts'))) {
				const name = new RegExp(join('src', 'i18n', locale, '(.+)', 'index.ts$')).exec(
					path,
				)?.[1];
				if (name && !pluginNames.includes(name))
					await rmdir(join('src', 'i18n', locale, name));
			}
		}

		await storeTranslationsToDisk(localeMapping, true);
	}

	public isPluginLoad(pluginName: string): boolean {
		return (
			this._plugins.findIndex((plugin) => plugin.name === pluginName) !== -1
		);
	}

	get plugins() {
		return this._plugins;
	}
}
