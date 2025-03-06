import {
	Slash as SlashX,
} from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashOptions } from '@/utils/types';

export function Slash (options?: SlashOptions | string) {
	if (typeof options === 'string') options = { name: options } as SlashOptions;
	else if (!options) options = {} as SlashOptions;

	if (!options.localizationSource && options.name)
		options.localizationSource = `COMMANDS.${constantPreserveDots(options.name)}` as SlashOptions['localizationSource'];

	options = setOptionsLocalization(options);

	return SlashX(options);
};
