import { of } from 'case';
import {
	SlashOption as SlashOptionX,
	type SlashOptionOptions as SlashOptionOptionsX,
	type VerifyName,
} from 'discordx';

import { InvalidOptionName } from '@/utils/errors';
import {
	constantPreserveDots,
	sanitizeLocales,
	setFallbackDescription,
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	SlashOptionOptions,
	TranslationsNestedPaths,
} from '@/utils/types';

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
	let localizationSource: TranslationsNestedPaths | null = null;

	if (options.localizationSource)
		localizationSource = constantPreserveDots(
			options.localizationSource,
		) as TranslationsNestedPaths;

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

	options = sanitizeLocales(options);

	if (!isValidOptionName(options['name'] as string))
		throw new InvalidOptionName(options['name'] as string);
	if (options.nameLocalizations) {
		for (const name of Object.values(options.nameLocalizations)) {
			if (!isValidOptionName(name)) throw new InvalidOptionName(name);
		}
	}

	if (!options['description']) options = setFallbackDescription(options);

	return SlashOptionX(
		options as SlashOptionOptionsX<VerifyName<string>, string>,
	);
}

function isValidOptionName(name: string) {
	return ['lower', 'snake'].includes(of(name)) && !name.includes(' ');
}
