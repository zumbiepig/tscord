import { existsSync } from 'node:fs';
import path from 'node:path';

import { type AnyEntity, type EntityClass } from '@mikro-orm/core';
import { glob } from 'glob';
import { coerce, satisfies, valid } from 'semver';
import { autoInjectable } from 'tsyringe';

import { generalConfig } from '@/configs';
import { type Locales, locales as i18nLocales, type Translation } from '@/i18n';
import { Logger } from '@/services';
import { BaseController } from '@/utils/classes';
import { getTscordVersion, resolveDependency } from '@/utils/functions';

@autoInjectable()
export class Plugin {
	// Common values
	private _name!: string;
	private _version!: string;
	private _valid = true;

	// Specific values
	private _entities!: Record<string, EntityClass<AnyEntity>>;
	private _controllers!: Record<string, typeof BaseController>;
	private _services!: Record<string, unknown>;
	private _translations!: Record<Locales, Translation>;

	private logger!: Logger;

	constructor(private _path: string) {}

	async load(): Promise<boolean> {
		this.logger = await resolveDependency(Logger);

		// read plugin.json
		const pluginJson = await (import(path.join(this._path, 'plugin.json')) as Promise<{
			name: string;
			version: string;
			tscordVersion: string;
		}>).catch(() => void 0);
		if (!pluginJson) {
			await this.stopLoad('plugin.json not found');
			return false;
		}

		// plugin name
		if (!pluginJson.name) {
			await this.stopLoad('Missing name in plugin.json');
			return false;
		}
		if (!/^[\w-]+$/.test(pluginJson.name)) {
			await this.stopLoad('Invalid name in plugin.json');
			return false;
		}

		// plugin version
		if (!pluginJson.version) {
			await this.stopLoad('Missing version in plugin.json');
			return false;
		}
		if (!valid(pluginJson.version)) {
			await this.stopLoad('Invalid version in plugin.json');
			return false;
		}

		// compatible tscord version
		if (!pluginJson.tscordVersion) {
			await this.stopLoad('Missing tscordVersion in plugin.json');
			return false;
		}
		if (!valid(pluginJson.tscordVersion)) {
			await this.stopLoad('Invalid version in plugin.json');
			return false;
		}

		// check if the plugin is compatible with the current version of Tscord
		if (
			!satisfies(coerce(getTscordVersion()) ?? '', pluginJson.tscordVersion)
		) {
			await this.stopLoad(`Incompatible with TSCord v${getTscordVersion()}`);
			return false;
		}

		if (!existsSync(path.join(this._path, 'main.ts'))) {
			await this.stopLoad(`Missing main entrypoint (main.ts)`);
			return false;
		}

		// assign common values
		this._name = pluginJson.name;
		this._version = pluginJson.version;

		// Load specific values
		this._entities = await this.getEntities();
		this._controllers = await this.getControllers();
		this._services = await this.getServices();
		this._translations = await this.getTranslations();

		return this._valid;
	}

	private async stopLoad(error: string) {
		this._valid = false;
		await this.logger.log(
			'error',
			`Plugin ${this._name || this._path}${this._version ? ` v${this._version}` : ''} is not valid: ${error}`,
		);
	}

	private async getControllers() {
		const importPath = path.join(this._path, 'api', 'controllers');
		if (!existsSync(importPath)) return {};
		return (await import(importPath)) as Record<string, typeof BaseController>;
	}

	private async getEntities() {
		const importPath = path.join(this._path, 'entities');
		if (!existsSync(importPath)) return {};
		return (await import(importPath)) as Record<string, EntityClass<AnyEntity>>;
	}

	private async getServices() {
		const importPath = path.join(this._path, 'services');
		if (!existsSync(importPath)) return {};
		return (await import(importPath)) as Record<string, unknown>;
	}

	private async getTranslations(): Promise<Record<Locales, Translation>> {
		const translations: Record<Locales, Translation> = {} as Record<
			Locales,
			Translation
		>;

		const missingLocales: Locales[] = [];

		for (const locale of i18nLocales) {
			const path_ = path.join(this._path, 'i18n', `${locale}.ts`);
			if (existsSync(path_)) {
				translations[locale] = (await import(path_)) as Translation;
			} else if (locale === generalConfig.defaultLocale) {
				await this.stopLoad(
					`Missing translation file for default locale '${locale}'`,
				);
				return {} as Record<Locales, Translation>;
			}
			else {
				missingLocales.push(locale);
				continue;
			}
		}

		if (missingLocales.length > 0) {
			await this.logger.log(
				'warn',
				`Plugin ${this._name} v${this._version} is missing translations for locales: '${missingLocales.join('\', \'')}'`,
			);
		}

		return translations;
	}

	async execMain() {
		await import(path.join(this._path, 'main.ts'));
	}

	async importCommands() {
		return Promise.all(
			(
				await glob(path.join(this._path, 'commands', '**', '*.ts'), {
					windowsPathsNoEscape: true,
				})
			).map(file => import(file)),
		);
	}

	async importEvents() {
		return Promise.all(
			(
				await glob(path.join(this._path, 'events', '**', '*.ts'), {
					windowsPathsNoEscape: true,
				})
			).map(file => import(file)),
		);
	}

	get path() {
		return this._path;
	}

	get name() {
		return this._name;
	}

	get version() {
		return this._version;
	}

	get entities() {
		return this._entities;
	}

	get controllers() {
		return this._controllers;
	}

	get services() {
		return this._services;
	}

	get translations() {
		return this._translations;
	}
}
