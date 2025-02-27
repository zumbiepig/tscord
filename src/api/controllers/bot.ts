import {
	BodyParams,
	Controller,
	Delete,
	Get,
	PathParams,
	Post,
	UseBefore,
} from '@tsed/common';
import { NotFound, Unauthorized } from '@tsed/exceptions';
import { Required } from '@tsed/schema';
import {
	BaseGuildTextChannel,
	BaseGuildVoiceChannel,
	ChannelType,
	GuildMember,
	Invite,
	NewsChannel,
	PermissionsBitField,
} from 'discord.js';
import { Client } from 'discordx';
import { injectable } from 'tsyringe';

import { BotOnline, DevAuthenticated } from '@/api/middlewares';
import { generalConfig } from '@/configs';
import { Guild, User } from '@/entities';
import { Database } from '@/services';
import { BaseController } from '@/utils/classes';
import {
	getDevs,
	isDev,
	isInMaintenance,
	resolveDependency,
	setMaintenance,
} from '@/utils/functions';

@Controller('/bot')
@UseBefore(BotOnline, DevAuthenticated)
@injectable()
export class BotController extends BaseController {
	constructor(
		private client: Client,
		private db: Database,
	) {
		super();
	}

	@Get('/info')
	async info() {
		const user = this.client.user?.toJSON() as Record<string, unknown>;
		user['iconURL'] = this.client.user?.displayAvatarURL();
		user['bannerURL'] = this.client.user?.bannerURL();

		return {
			user,
			owner: (
				await this.client.users
					.fetch(generalConfig.ownerId ?? '')
					.catch(() => undefined)
			)?.toJSON(),
		};
	}

	@Get('/commands')
	async commands() {
		const client = await resolveDependency(Client);
		const commands = client.applicationCommands;

		return commands.map((command) => command.toJSON());
	}

	@Get('/guilds')
	async guilds() {
		const body: unknown[] = [];

		for (const discordRawGuild of this.client.guilds.cache.values()) {
			const discordGuild = discordRawGuild.toJSON() as Record<string, unknown>;
			discordGuild['iconURL'] = discordRawGuild.iconURL();
			discordGuild['bannerURL'] = discordRawGuild.bannerURL();

			const databaseGuild = await this.db
				.get(Guild)
				.findOne(discordRawGuild.id);

			body.push({
				discord: discordGuild,
				database: databaseGuild,
			});
		}

		return body;
	}

	@Get('/guilds/:id')
	async guild(@PathParams('id') id: string) {
		// get discord guild
		const discordRawGuild = await this.client.guilds
			.fetch(id)
			.catch(() => undefined);
		if (!discordRawGuild) throw new NotFound('Guild not found');

		const discordGuild = discordRawGuild.toJSON() as Record<string, unknown>;
		discordGuild['iconURL'] = discordRawGuild.iconURL();
		discordGuild['bannerURL'] = discordRawGuild.bannerURL();

		// get database guild
		const databaseGuild = await this.db.get(Guild).findOne(id);

		return {
			discord: discordGuild,
			database: databaseGuild,
		};
	}

	@Delete('/guilds/:id')
	async deleteGuild(@PathParams('id') id: string) {
		const guild = await this.client.guilds.fetch(id).catch(() => undefined);
		if (!guild) throw new NotFound('Guild not found');

		await guild.leave();

		return {
			success: true,
			message: 'Guild deleted',
		};
	}

	@Get('/guilds/:id/invite')
	async invite(@PathParams('id') id: string) {
		const guild = await this.client.guilds.fetch(id).catch(() => undefined);
		if (!guild) throw new NotFound('Guild not found');

		const guildChannels = await guild.channels.fetch();

		let invite: Invite | undefined;
		for (const channel of guildChannels.values()) {
			if (
				channel &&
				guild.members.me
					?.permissionsIn(channel)
					.has(PermissionsBitField.Flags.CreateInstantInvite) &&
				[
					ChannelType.GuildText,
					ChannelType.GuildVoice,
					ChannelType.GuildAnnouncement,
				].includes(channel.type)
			) {
				invite = await (
					channel as BaseGuildTextChannel | BaseGuildVoiceChannel | NewsChannel
				).createInvite();
				break;
			}
		}

		if (invite) return invite.toJSON();
		else
			throw new Unauthorized(
				'Missing permission to create an invite in this guild',
			);
	}

	@Get('/users')
	async users() {
		const users: unknown[] = [];
		const guilds = this.client.guilds.cache.values();

		for (const guild of guilds) {
			const members = await guild.members.fetch();

			for (const member of members.values()) {
				if (!users.find((user) => (user as GuildMember).id === member.id)) {
					const discordUser = member.user.toJSON() as Record<string, unknown>;
					discordUser['iconURL'] = member.user.displayAvatarURL();
					discordUser['bannerURL'] = member.user.bannerURL();

					const databaseUser = await this.db.get(User).findOne(member.user.id);

					users.push({
						discord: discordUser,
						database: databaseUser,
					});
				}
			}
		}

		return users;
	}

	@Get('/users/:id')
	async user(@PathParams('id') id: string) {
		// get discord user
		const discordRawUser = await this.client.users
			.fetch(id)
			.catch(() => undefined);
		if (!discordRawUser) throw new NotFound('User not found');

		const discordUser = discordRawUser.toJSON() as Record<string, unknown>;
		discordUser['iconURL'] = discordRawUser.displayAvatarURL();
		discordUser['bannerURL'] = discordRawUser.bannerURL();

		// get database user
		const databaseUser = await this.db.get(User).findOne(id);

		return {
			discord: discordUser,
			database: databaseUser,
		};
	}

	@Get('/users/cached')
	cachedUsers() {
		return this.client.users.cache.map((user) => user.toJSON());
	}

	@Get('/maintenance')
	async maintenance() {
		return {
			maintenance: await isInMaintenance(),
		};
	}

	@Post('/maintenance')
	async setMaintenance(
		@Required() @BodyParams('maintenance') maintenance: boolean,
	) {
		await setMaintenance(maintenance);

		return {
			maintenance,
		};
	}

	@Get('/devs')
	devs() {
		return getDevs();
	}

	@Get('/devs/:id')
	dev(@PathParams('id') id: string) {
		return isDev(id);
	}
}
