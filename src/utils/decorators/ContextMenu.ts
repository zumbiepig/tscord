import { ContextMenu as ContextMenuX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { ContextMenuOptions, TranslationPath } from '@/utils/types';

export const ContextMenu = (options: ContextMenuOptions) => {
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
			options,
			target: 'name',
			localizationSource,
		});
	}

	return ContextMenuX(options);
};
