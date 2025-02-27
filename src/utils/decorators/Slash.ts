import {
	type ApplicationCommandOptions as ApplicationCommandOptionsX,
	Slash as SlashX,
	type VerifyName,
} from 'discordx';

import {
	constantPreserveDots,
	setFallbackDescription,
	setOptionsLocalization,
} from '@/utils/functions';
import type { ApplicationCommandOptions, TranslationPath } from '@/utils/types';

export const Slash = (options?: ApplicationCommandOptions) => {
	if (!options) options = {};
	else if (typeof options === 'string') options = { name: options };

	let localizationSource: TranslationPath | undefined;

	if (options.localizationSource)
		localizationSource = constantPreserveDots(
			options.localizationSource,
		) as TranslationPath;
	else if (options.name)
		localizationSource =
			`COMMANDS.${constantPreserveDots(options.name)}` as TranslationPath;

	if (localizationSource) {
		options = setOptionsLocalization({
			target: 'description',
			options,
			localizationSource,
		});

		options = setOptionsLocalization({
			target: 'name',
			options,
			localizationSource,
		});
	}

	if (!options.description) options = setFallbackDescription(options);

	return SlashX(
		options as ApplicationCommandOptionsX<VerifyName<string>, string>,
	);
};
