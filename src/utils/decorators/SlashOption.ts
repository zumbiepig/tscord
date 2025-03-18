import { ApplicationCommandOptionBase } from 'discord.js';
import { SlashOption as SlashOptionX } from 'discordx';

import { getLocalizedOptions } from '@/utils/functions';
import type { SlashOptionOptions } from '@/utils/types';

export function SlashOption<T extends string, TD extends string>(...[options, transformer]: SlashOptionOptions<T, TD>) {
	return options instanceof ApplicationCommandOptionBase
		? SlashOptionX(options, transformer)
		: SlashOptionX<T, TD>(getLocalizedOptions<Parameters<typeof SlashOptionX<T, TD>>[0]>(options), transformer);
}
