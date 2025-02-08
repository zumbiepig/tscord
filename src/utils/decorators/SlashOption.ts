import {
	SlashOption as SlashOptionX,
	type SlashOptionOptions as SlashOptionOptionsX,
	type VerifyName,
} from 'discordx';

import { InvalidOptionNameError } from '@/utils/errors';
import {
	constantPreserveDots,
	setFallbackDescription,
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashOptionOptions, TranslationPath } from '@/utils/types';

/**
 * Add a slash command option
 *
 * @param options - Slash option options
 * ___
 *
 * [View Documentation](https://discordx.js.org/docs/decorators/commands/slash-option)
 *
 * @category Decorator
 */
export function SlashOption(options: SlashOptionOptions) {
	let localizationSource: TranslationPath | null = null;

	if (options.localizationSource)
		localizationSource = constantPreserveDots(
			options.localizationSource,
		) as TranslationPath;

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

	if (!isValidOptionName(options.name))
		throw new InvalidOptionNameError(options.name);
	if (options.nameLocalizations) {
		for (const name of Object.values(options.nameLocalizations)) {
			if (!isValidOptionName(name)) throw new InvalidOptionNameError(name);
		}
	}

	if (!options.description) options = setFallbackDescription(options);

	return SlashOptionX(
		options as SlashOptionOptionsX<VerifyName<string>, string>,
	);
}

function isValidOptionName(name: string) {
	return /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.exec(name);
}
