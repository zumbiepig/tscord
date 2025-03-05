import { ContextMenu as ContextMenuX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { ContextMenuOptions, TranslationPaths } from '@/utils/types';

export function ContextMenu  (options: ContextMenuOptions) {
	const localizationSource: TranslationPaths | undefined = options.localizationSource ?? (options.name ? `COMMANDS.${constantPreserveDots(options.name)}` as TranslationPaths : undefined);

	if (localizationSource)
		options = setOptionsLocalization({
			options,
			target: 'name',
			localizationSource,
		});

	return ContextMenuX(options);
};
