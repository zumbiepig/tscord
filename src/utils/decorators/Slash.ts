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

/**
 * Handle a slash command
 * @param options - slash options
 * ___
 *
 * [View Documentation](https://discordx.js.org/docs/decorators/commands/slash)
 *
 * @category Decorator
 */
export function Slash(options?: ApplicationCommandOptions) {
	if (!options) options = {};
	else if (typeof options === 'string') options = { name: options };

	let localizationSource: TranslationPath | null = null;

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
}
