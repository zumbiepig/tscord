import { ContextMenu as ContextMenuX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { ContextMenuOptions, TranslationPaths } from '@/utils/types';

export function ContextMenu  (options: ContextMenuOptions) {
	if (!options.localizationSource && options.name)
		options.localizationSource = `COMMANDS.${constantPreserveDots(options.name)}` as ContextMenuOptions['localizationSource'];

	options = setOptionsLocalization(options);

	return ContextMenuX(options);
};
