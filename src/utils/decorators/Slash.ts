import { SlashCommandBuilder } from 'discord.js';
import { Slash as SlashX } from 'discordx';

import { getLocalizedOptions } from '@/utils/functions';
import type { SlashOptions } from '@/utils/types';

export function Slash<T extends string, TD extends string>(...[options]: SlashOptions<T, TD>) {
	return options instanceof SlashCommandBuilder
		? SlashX(options)
		: SlashX<T, TD>(getLocalizedOptions<Parameters<typeof SlashX<T, TD>>[0]>(options));
}
