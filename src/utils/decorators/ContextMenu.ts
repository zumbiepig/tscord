import { ContextMenu as ContextMenuX } from 'discordx';

import {
	constantPreserveDots,
	getCallerFile,
	sanitizeLocales,
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	ContextMenuOptions,
	TranslationsNestedPaths,
} from '@/utils/types';

/**
 * Interact with context menu with a defined identifier
 *
 * @param options - Application command options
 * ___
 *
 * [View Documentation](https://discordx.js.org/docs/decorators/gui/context-menu)
 *
 * @category Decorator
 */
export function ContextMenu(options: ContextMenuOptions) {
	let localizationSource: TranslationsNestedPaths | null = null;
	const commandNameFromFile = getCallerFile(1)?.split('/').pop()?.split('.')[0];

	if (options.localizationSource)
		localizationSource = constantPreserveDots(
			options.localizationSource,
		) as TranslationsNestedPaths;
	else if (options.name)
		localizationSource =
			`COMMANDS.${constantPreserveDots(options.name)}` as TranslationsNestedPaths;
	else if (commandNameFromFile)
		localizationSource =
			`COMMANDS.${constantPreserveDots(commandNameFromFile)}` as TranslationsNestedPaths;

	if (localizationSource) {
		options = setOptionsLocalization({
			options,
			target: 'name',
			localizationSource,
			...(commandNameFromFile && { nameFallback: commandNameFromFile }),
		});
	}

	return ContextMenuX(sanitizeLocales(options));
}
