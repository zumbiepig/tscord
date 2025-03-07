import {
	SlashOption as SlashOptionX,
} from 'discordx';

import { InvalidOptionNameError } from '@/utils/errors';
import {
	isValidDiscordName,
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashOptionOptions } from '@/utils/types';

export function SlashOption<T extends string = never, TD extends string = never>(options: SlashOptionOptions<T, TD>) {
	options = setOptionsLocalization(options);

	for (const name of [options.name, ...Object.values(options.nameLocalizations ?? {})])
		if (!isValidDiscordName(name ?? '')) throw new InvalidOptionNameError(name ?? '');

	return SlashOptionX(options);
};

SlashOption<>('a')