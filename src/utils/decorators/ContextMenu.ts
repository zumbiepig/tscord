import { basename } from 'node:path';

import { ContextMenu as ContextMenuX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { ContextMenuOptions, TranslationPath } from '@/utils/types';

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
	let localizationSource: TranslationPath | null = null;
	const commandNameFromFile = /^(.*)\..*$/.exec(
		basename(getCallerFile(1) ?? ''),
	)?.[1];

	if (options.localizationSource)
		localizationSource = constantPreserveDots(
			options.localizationSource,
		) as TranslationPath;
	else if (options.name)
		localizationSource =
			`COMMANDS.${constantPreserveDots(options.name)}` as TranslationPath;
	else if (commandNameFromFile)
		localizationSource =
			`COMMANDS.${constantPreserveDots(commandNameFromFile)}` as TranslationPath;

	if (localizationSource) {
		options = setOptionsLocalization({
			options,
			target: 'name',
			localizationSource,
			...(commandNameFromFile && { nameFallback: commandNameFromFile }),
		});
	}

	return ContextMenuX(options);
}
