import fs from 'node:fs';
import { sep } from 'node:path';

import { importx, resolve } from '@discordx/importer';
import { type AnyEntity, type EntityClass } from '@mikro-orm/core';
import semver from 'semver';
import { type BaseTranslation } from 'typesafe-i18n';

import { locales } from '@/i18n';
import { BaseController } from '@/utils/classes';
import { getSourceCodeLocation, getTscordVersion } from '@/utils/functions';

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
	private _translations!: Record<string, BaseTranslation>;

	constructor(path: string) {
		this._path = path.replace('file://', '')
	}

	public async load(): Promise<void> {
		// check if the plugin.json is present
		if (!fs.existsSync(`${this._path}/plugin.json`))
			return this.stopLoad('plugin.json not found')

		// read plugin.json
		const pluginConfig = await import(`${this._path}/plugin.json`);

		// check if the plugin.json is valid
		if (!pluginConfig.name) {
			this.stopLoad('Missing name in plugin.json');
			return;
		}
		if (!pluginConfig.version) {
			this.stopLoad('Missing version in plugin.json');
			return;
		}
		if (!pluginConfig.tscordRequiredVersion) {
			this.stopLoad('Missing tscordRequiredVersion in plugin.json');
			return;
		}

		// check plugin.json values
		if (!pluginConfig.name.match(/^[a-zA-Z0-9-_]+$/)) {
			this.stopLoad('Invalid name in plugin.json');
			return;
		}
		if (!semver.valid(pluginConfig.version)) {
			this.stopLoad('Invalid version in plugin.json');
			return;
		}

		// check if the plugin is compatible with the current version of Tscord
		if (
			!semver.satisfies(
				semver.coerce(getTscordVersion()) ?? '',
				pluginConfig.tscordRequiredVersion,
			)
		) {
			this.stopLoad(
				`Incompatible with the current version of TSCord (v${getTscordVersion()})`,
			);
			return;
		}

		// assign common values
		this._name = pluginConfig.name;
		this._version = pluginConfig.version;

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

	private async getControllers(): Promise<
		Record<string, typeof BaseController>
	> {
		if (!fs.existsSync(`${this._path}/api/controllers`)) return {};

		return import(`${this._path}/api/controllers`);
	}

	private async getEntities(): Promise<Record<string, EntityClass<AnyEntity>>> {
		if (!fs.existsSync(`${this._path}/entities`)) return {};

		return import(`${this._path}/entities`);
	}

	private async getServices(): Promise<Record<string, unknown>> {
		if (!fs.existsSync(`${this._path}/services`)) return {};

		return import(`${this._path}/services`);
	}

	private async getTranslations(): Promise<Record<string, BaseTranslation>> {
		const translations: Record<string, BaseTranslation> = {};

		const localesPath = await resolve(`${this._path}/i18n/*.{ts,js}`);
		for (const localeFile of localesPath) {
			const locale = localeFile.split(sep).at(-1)?.split('.')[0] ?? 'unknown';

			translations[locale] = (await import(localeFile)).default;
		}

		for (const defaultLocale of locales) {
			const path = `${getSourceCodeLocation()}/i18n/${defaultLocale}/${this._name}/_custom.`;
			if (fs.existsSync(`${path}js`))
				translations[defaultLocale] = (await import(`${path}js`)).default;
			else if (fs.existsSync(`${path}ts`))
				translations[defaultLocale] = (await import(`${path}ts`)).default;
		}

		return translations;
	}

	public async execMain(): Promise<void> {
		if (!fs.existsSync(`${this._path}/main.ts`)) return;
		await import(`${this._path}/main.ts`);
	}

	public async importCommands(): Promise<void> {
		await importx(`${this._path}/commands/**/*.{ts,js}`);
	}

	public async importEvents(): Promise<void> {
		await importx(`${this._path}/events/**/*.{ts,js}`);
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
