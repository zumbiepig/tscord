import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { importx } from '@discordx/importer';
import { type AnyEntity, type EntityClass } from '@mikro-orm/core';
import { coerce, satisfies, valid } from 'semver';

import { generalConfig } from '@/configs';
import { type Locales, locales, type Translation } from '@/i18n';
import { BaseController } from '@/utils/classes';
import { getTscordVersion } from '@/utils/functions';

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
	private _translations!: Record<string, Translation>;

	constructor(path: string) {
		this._path = path.replace('file://', '');
	}

	public async load(): Promise<void> {
		// check if the plugin.json is present
		if (!existsSync(`${this._path}/plugin.json`)) {
			this.stopLoad('plugin.json not found');
			return;
		}

		// read plugin.json
		const pluginConfig = (await import(`${this._path}/plugin.json`)) as Record<
			string,
			string
		>;

		// check if the plugin.json is valid
		if (!pluginConfig['name']) {
			this.stopLoad('Missing name in plugin.json');
			return;
		}
		if (!pluginConfig['version']) {
			this.stopLoad('Missing version in plugin.json');
			return;
		}
		if (!pluginConfig['tscordVersion']) {
			this.stopLoad('Missing tscordVersion in plugin.json');
			return;
		}

		// check plugin.json values
		if (!/^[a-zA-Z0-9_-]+$/.exec(pluginConfig['name'])) {
			this.stopLoad('Invalid name in plugin.json');
			return;
		}
		if (!valid(pluginConfig['version'])) {
			this.stopLoad('Invalid version in plugin.json');
			return;
		}

		// check if the plugin is compatible with the current version of Tscord
		if (
			!satisfies(
				coerce(getTscordVersion()) ?? '',
				pluginConfig['tscordVersion'],
			)
		) {
			this.stopLoad(`Incompatible with TSCord v${getTscordVersion()}`);
			return;
		}

		if (!existsSync(`${this._path}/main.ts`)) {
			this.stopLoad(`Missing main entrypoint (main.ts)`);
			return;
		}

		// assign common values
		this._name = pluginConfig['name'];
		this._version = pluginConfig['version'];

		// Load specific values
		this._entities = await this.getEntities();
		this._controllers = await this.getControllers();
		this._services = await this.getServices();
		this._translations = await this.getTranslations();
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

	private async getTranslations() {
		const translations = {} as Record<Locales, Translation>;

		for (const locale of locales) {
			const path = resolve(`${this._path}/i18n/${locale}.ts`);
			if (!existsSync(path)) {
				if (locale === generalConfig.defaultLocale) {
					this.stopLoad(
						`Missing translation file for default locale ${locale}`,
					);
				} else {
					console.error(
						`Plugin ${this._name} v${this._version} is missing translations for locale ${locale}`,
					);
					continue;
				}
			}
			translations[locale] = (await import(path)) as Translation;
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

	public isValid(): boolean {
		return this._valid;
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
