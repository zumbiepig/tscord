import { ContextMenu as ContextMenuX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { ContextMenuOptions } from '@/utils/types';

export function ContextMenu<T extends string>  (options: ContextMenuOptions<T>) {
	if (!options.localizationSource && options.name)
		options.localizationSource = `COMMANDS.${constantPreserveDots(options.name)}` as ContextMenuOptions<T>['localizationSource'];

	options = setOptionsLocalization(options);

	return ContextMenuX(options);
};
