import type { ArgsOf, GuardFunction } from 'discordx';

/**
 * Pass only when the message match with a passed regular expression
 * @param regex The regex to test
 */
export function Match(regex: RegExp) {
	const guard: GuardFunction<ArgsOf<'messageCreate'>> = async (
		[message],
		_client,
		next,
	) => {
		if (message.content.match(regex)) return next();
		else return;
	};

	return guard;
}
