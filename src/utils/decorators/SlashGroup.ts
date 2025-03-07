import {
	SlashGroup as SlashGroupX,
} from 'discordx';

import {
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashGroupOptions } from '@/utils/types';

//export function SlashGroup<T extends string>(options: SlashGroupOptions<T,never,never>)
export function SlashGroup<T extends string = never, TD extends string = never, TR extends string = never>(options: SlashGroupOptions<T, TD, TR>, root?: Parameters<typeof SlashGroupX<T, TD>>[1]) {
	if (typeof options === 'string') return root ? SlashGroupX(options, root) : SlashGroupX(options);
	else return SlashGroupX(setOptionsLocalization(options));
};
