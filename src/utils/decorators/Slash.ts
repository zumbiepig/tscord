import {
	type ApplicationCommandOptions as ApplicationCommandOptionsX,
	Slash as SlashX,
	type VerifyName,
} from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashOptions, TranslationPaths } from '@/utils/types';

export function Slash (options?: SlashOptions) {
	if (!options) options = {} as SlashOptions;
	else if (typeof options === 'string') options = { name: options } as SlashOptions;

	let localizationSource: TranslationPaths | undefined;

	if (options.localizationSource)
		localizationSource = constantPreserveDots(
			options.localizationSource,
		) as TranslationPaths;
	else if (options.name)
		localizationSource =
			`COMMANDS.${constantPreserveDots(options.name)}` as TranslationPaths;

	if (localizationSource)
		options = setOptionsLocalization({
			target: 'name_and_description',
			options,
			localizationSource,
		});

	return SlashX(
		options as ApplicationCommandOptionsX<VerifyName<string>, string>,
	);
};
