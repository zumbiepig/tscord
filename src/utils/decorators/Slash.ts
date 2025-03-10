import { Slash as SlashX } from 'discordx';

import { constantPreserveDots, setOptionsLocalization } from '@/utils/functions';
import type { SlashOptions } from '@/utils/types';

export function Slash<T extends string, TD extends string>(...[options]: SlashOptions<T, TD>[1]) {
	if (typeof options === 'string') options = { name: options } as SlashOptions<T, TD>[1];
	else if (!options) options = {} as SlashOptions<T, TD>;

	if (!options.localizationSource && options.name)
		options.localizationSource = `COMMANDS.${constantPreserveDots(options.name)}` as SlashOptions<
			T,
			TD
		>[1]['localizationSource'];

	options = setOptionsLocalization(options);

	return SlashX(options);
}

Slash({ name: 'a' });
