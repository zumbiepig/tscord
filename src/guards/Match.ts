import type { ArgsOf, GuardFunction } from 'discordx';

/**
 * Pass only when the message match with a passed regular expression
 * @param regex The regex to test
 * @param invert Pass only when the message does NOT match the regex
 */
export function Match(
	regex: RegExp,
	invert = false,
): GuardFunction<ArgsOf<'messageCreate'>> {
	return async ([interaction], _client, next) => {
		if (!!regex.exec(interaction.content) === !invert) await next();
	};
}
