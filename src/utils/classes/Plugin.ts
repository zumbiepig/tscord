import { existsSync } from 'node:fs';

import { importx } from '@discordx/importer';
import { type AnyEntity, type EntityClass } from '@mikro-orm/core';
import { coerce, satisfies, valid } from 'semver';

import { generalConfig } from '@/configs';
import { type BaseTranslation, type Locales, locales } from '@/i18n';
import packageJson from '@/packageJson';
import { BaseController } from '@/utils/classes';

export class Plugin {
	// Common values
	private _path: string;
	private _name!: string;
	private _version!: string;
	private _valid = true;

	// Specific values
	private _entities!: Record<string, EntityClass<AnyEntity>>;
	private _controllers!: Record<string, typeof BaseController>;
	private _services!: Record<string, unknown>;
	private _translations!: Record<Locales, BaseTranslation>;

	constructor(path: string) {
		this._path = path;
	}

	public async load(): Promise<boolean> {
		// check if the plugin.json is present
		if (!existsSync(`${this._path}/plugin.json`)) {
			this.stopLoad('plugin.json not found');
			return false;
		}

		// read plugin.json
		const pluginConfig = (await import(`${this._path}/plugin.json`)) as Record<
			string,
			string
		>;

		// check if the plugin.json is valid
		if (!pluginConfig['name']) {
			this.stopLoad('Missing name in plugin.json');
			return false;
		}
		if (!pluginConfig['version']) {
			this.stopLoad('Missing version in plugin.json');
			return false;
		}
		if (!pluginConfig['tscordVersion']) {
			this.stopLoad('Missing tscordVersion in plugin.json');
			return false;
		}

		// check plugin.json values
		if (!/^[a-zA-Z0-9_-]+$/.exec(pluginConfig['name'])) {
			this.stopLoad('Invalid name in plugin.json');
			return false;
		}
		if (!valid(pluginConfig['version'])) {
			this.stopLoad('Invalid version in plugin.json');
			return false;
		}

		// check if the plugin is compatible with the current version of Tscord
		if (
			!satisfies(
				coerce(
					(packageJson as { tscord: { version: string } }).tscord.version,
				) ?? '',
				pluginConfig['tscordVersion'],
			)
		) {
			this.stopLoad(
				`Incompatible with TSCord v${(packageJson as { tscord: { version: string } }).tscord.version}`,
			);
			return false;
		}

		if (!existsSync(`${this._path}/main.ts`)) {
			this.stopLoad(`Missing main entrypoint (main.ts)`);
			return false;
		}

		// assign common values
		this._name = pluginConfig['name'];
		this._version = pluginConfig['version'];

		// Load specific values
		this._entities = await this.getEntities();
		this._controllers = await this.getControllers();
		this._services = await this.getServices();
		this._translations = await this.getTranslations();

		if (this._valid) return true;
		else return false;
	}

	private stopLoad(error: string): void {
		this._valid = false;
		console.error(
			`Plugin ${this._name ? this._name : this._path} ${this._version ? `v${this._version}` : ''} is not valid: ${error}`,
		);
	}

	private async getControllers() {
		if (!existsSync(`${this._path}/api/controllers`)) return {};
		return (await import(`${this._path}/api/controllers`)) as Record<
			string,
			typeof BaseController
		>;
	}

	private async getEntities() {
		if (!existsSync(`${this._path}/entities`)) return {};
		return (await import(`${this._path}/entities`)) as Record<
			string,
			EntityClass<AnyEntity>
		>;
	}

	private async getServices() {
		if (!existsSync(`${this._path}/services`)) return {};
		return (await import(`${this._path}/services`)) as Record<string, unknown>;
	}

	private async getTranslations(): Promise<Record<Locales, BaseTranslation>> {
		const translations: Record<Locales, BaseTranslation> = {} as Record<
			Locales,
			BaseTranslation
		>;

		for (const locale of locales) {
			const path = `${this._path}/i18n/${locale}.ts`;
			if (!existsSync(path)) {
				if (locale === generalConfig.defaultLocale) {
					this.stopLoad(
						`Missing translation file for default locale '${locale}'`,
					);
					return {} as Record<Locales, BaseTranslation>;
				} else {
					console.warn(
						`Plugin ${this._name} v${this._version} is missing translations for locale '${locale}'`,
					);
					continue;
				}
			}
			translations[locale] = (await import(path)) as BaseTranslation;
		}

		return translations;
	}

	public async execMain() {
		await import(`${this._path}/main.ts`);
	}

	public async importCommands() {
		await importx(`${this._path}/commands/**/*.ts`);
	}

	public async importEvents() {
		await importx(`${this._path}/events/**/*.ts`);
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
