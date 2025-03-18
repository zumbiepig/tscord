import { ContextMenu as ContextMenuX } from 'discordx';

import { getLocalizedOptions } from '@/utils/functions';
import type { ContextMenuOptions } from '@/utils/types';

export function ContextMenu<T extends string>(...[options]: ContextMenuOptions<T>) {
	return ContextMenuX<T>(getLocalizedOptions<Parameters<typeof ContextMenuX<T>>[0]>(options));
}
