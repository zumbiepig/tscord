/**
 * Get a union of up to 100 overloads from a function.
 */
export type Overloads<T extends (...args: unknown[]) => unknown> = T extends {
	(...args: infer A1): infer R1;
	(...args: infer A2): infer R2;
	(...args: infer A3): infer R3;
	(...args: infer A4): infer R4;
	(...args: infer A5): infer R5;
	(...args: infer A6): infer R6;
	(...args: infer A7): infer R7;
	(...args: infer A8): infer R8;
	(...args: infer A9): infer R9;
	(...args: infer A10): infer R10;
	(...args: infer A11): infer R11;
	(...args: infer A12): infer R12;
	(...args: infer A13): infer R13;
	(...args: infer A14): infer R14;
	(...args: infer A15): infer R15;
	(...args: infer A16): infer R16;
	(...args: infer A17): infer R17;
	(...args: infer A18): infer R18;
	(...args: infer A19): infer R19;
	(...args: infer A20): infer R20;
	(...args: infer A21): infer R21;
	(...args: infer A22): infer R22;
	(...args: infer A23): infer R23;
	(...args: infer A24): infer R24;
	(...args: infer A25): infer R25;
	(...args: infer A26): infer R26;
	(...args: infer A27): infer R27;
	(...args: infer A28): infer R28;
	(...args: infer A29): infer R29;
	(...args: infer A30): infer R30;
	(...args: infer A31): infer R31;
	(...args: infer A32): infer R32;
	(...args: infer A33): infer R33;
	(...args: infer A34): infer R34;
	(...args: infer A35): infer R35;
	(...args: infer A36): infer R36;
	(...args: infer A37): infer R37;
	(...args: infer A38): infer R38;
	(...args: infer A39): infer R39;
	(...args: infer A40): infer R40;
	(...args: infer A41): infer R41;
	(...args: infer A42): infer R42;
	(...args: infer A43): infer R43;
	(...args: infer A44): infer R44;
	(...args: infer A45): infer R45;
	(...args: infer A46): infer R46;
	(...args: infer A47): infer R47;
	(...args: infer A48): infer R48;
	(...args: infer A49): infer R49;
	(...args: infer A50): infer R50;
	(...args: infer A51): infer R51;
	(...args: infer A52): infer R52;
	(...args: infer A53): infer R53;
	(...args: infer A54): infer R54;
	(...args: infer A55): infer R55;
	(...args: infer A56): infer R56;
	(...args: infer A57): infer R57;
	(...args: infer A58): infer R58;
	(...args: infer A59): infer R59;
	(...args: infer A60): infer R60;
	(...args: infer A61): infer R61;
	(...args: infer A62): infer R62;
	(...args: infer A63): infer R63;
	(...args: infer A64): infer R64;
	(...args: infer A65): infer R65;
	(...args: infer A66): infer R66;
	(...args: infer A67): infer R67;
	(...args: infer A68): infer R68;
	(...args: infer A69): infer R69;
	(...args: infer A70): infer R70;
	(...args: infer A71): infer R71;
	(...args: infer A72): infer R72;
	(...args: infer A73): infer R73;
	(...args: infer A74): infer R74;
	(...args: infer A75): infer R75;
	(...args: infer A76): infer R76;
	(...args: infer A77): infer R77;
	(...args: infer A78): infer R78;
	(...args: infer A79): infer R79;
	(...args: infer A80): infer R80;
	(...args: infer A81): infer R81;
	(...args: infer A82): infer R82;
	(...args: infer A83): infer R83;
	(...args: infer A84): infer R84;
	(...args: infer A85): infer R85;
	(...args: infer A86): infer R86;
	(...args: infer A87): infer R87;
	(...args: infer A88): infer R88;
	(...args: infer A89): infer R89;
	(...args: infer A90): infer R90;
	(...args: infer A91): infer R91;
	(...args: infer A92): infer R92;
	(...args: infer A93): infer R93;
	(...args: infer A94): infer R94;
	(...args: infer A95): infer R95;
	(...args: infer A96): infer R96;
	(...args: infer A97): infer R97;
	(...args: infer A98): infer R98;
	(...args: infer A99): infer R99;
	(...args: infer A100): infer R100;
}
	?
			| ((...args: A1) => R1)
			| ((...args: A2) => R2)
			| ((...args: A3) => R3)
			| ((...args: A4) => R4)
			| ((...args: A5) => R5)
			| ((...args: A6) => R6)
			| ((...args: A7) => R7)
			| ((...args: A8) => R8)
			| ((...args: A9) => R9)
			| ((...args: A10) => R10)
			| ((...args: A11) => R11)
			| ((...args: A12) => R12)
			| ((...args: A13) => R13)
			| ((...args: A14) => R14)
			| ((...args: A15) => R15)
			| ((...args: A16) => R16)
			| ((...args: A17) => R17)
			| ((...args: A18) => R18)
			| ((...args: A19) => R19)
			| ((...args: A20) => R20)
			| ((...args: A21) => R21)
			| ((...args: A22) => R22)
			| ((...args: A23) => R23)
			| ((...args: A24) => R24)
			| ((...args: A25) => R25)
			| ((...args: A26) => R26)
			| ((...args: A27) => R27)
			| ((...args: A28) => R28)
			| ((...args: A29) => R29)
			| ((...args: A30) => R30)
			| ((...args: A31) => R31)
			| ((...args: A32) => R32)
			| ((...args: A33) => R33)
			| ((...args: A34) => R34)
			| ((...args: A35) => R35)
			| ((...args: A36) => R36)
			| ((...args: A37) => R37)
			| ((...args: A38) => R38)
			| ((...args: A39) => R39)
			| ((...args: A40) => R40)
			| ((...args: A41) => R41)
			| ((...args: A42) => R42)
			| ((...args: A43) => R43)
			| ((...args: A44) => R44)
			| ((...args: A45) => R45)
			| ((...args: A46) => R46)
			| ((...args: A47) => R47)
			| ((...args: A48) => R48)
			| ((...args: A49) => R49)
			| ((...args: A50) => R50)
			| ((...args: A51) => R51)
			| ((...args: A52) => R52)
			| ((...args: A53) => R53)
			| ((...args: A54) => R54)
			| ((...args: A55) => R55)
			| ((...args: A56) => R56)
			| ((...args: A57) => R57)
			| ((...args: A58) => R58)
			| ((...args: A59) => R59)
			| ((...args: A60) => R60)
			| ((...args: A61) => R61)
			| ((...args: A62) => R62)
			| ((...args: A63) => R63)
			| ((...args: A64) => R64)
			| ((...args: A65) => R65)
			| ((...args: A66) => R66)
			| ((...args: A67) => R67)
			| ((...args: A68) => R68)
			| ((...args: A69) => R69)
			| ((...args: A70) => R70)
			| ((...args: A71) => R71)
			| ((...args: A72) => R72)
			| ((...args: A73) => R73)
			| ((...args: A74) => R74)
			| ((...args: A75) => R75)
			| ((...args: A76) => R76)
			| ((...args: A77) => R77)
			| ((...args: A78) => R78)
			| ((...args: A79) => R79)
			| ((...args: A80) => R80)
			| ((...args: A81) => R81)
			| ((...args: A82) => R82)
			| ((...args: A83) => R83)
			| ((...args: A84) => R84)
			| ((...args: A85) => R85)
			| ((...args: A86) => R86)
			| ((...args: A87) => R87)
			| ((...args: A88) => R88)
			| ((...args: A89) => R89)
			| ((...args: A90) => R90)
			| ((...args: A91) => R91)
			| ((...args: A92) => R92)
			| ((...args: A93) => R93)
			| ((...args: A94) => R94)
			| ((...args: A95) => R95)
			| ((...args: A96) => R96)
			| ((...args: A97) => R97)
			| ((...args: A98) => R98)
			| ((...args: A99) => R99)
			| ((...args: A100) => R100)
	: never;

/**
 * Extract the more specific types from a tuple of unions.
 *
 * @example
 * ```
 * type MoreSpecificTypes = ExtractMoreSpecificTypes<[string | number, string | 42]>; // `string | 42`
 * ```
 */
export type ExtractMoreSpecificTypes<T extends unknown[]> = T extends [infer U]
	? U
	: ExtractMoreSpecificTypes<
			T extends [infer A, infer B, ...infer Rest]
				? [
						(
							| (A extends unknown ? (Extract<B, A> extends never ? A : never) : never)
							| (B extends unknown ? (Extract<A, B> extends never ? B : never) : never)
							| (A extends unknown ? (A extends Extract<B, A> ? A : never) : never)
							| (B extends unknown ? (B extends Extract<A, B> ? B : never) : never)
						),
						...Rest,
					]
				: []
		>;

/**
 * Get the parameters of the overloads of a function, extracting more specific types if they exist.
 *
 * @example
 * ```
 * declare function someFunction(...args: number[]): void;
 * declare function someFunction(...args: 42[] | string[]): void;
 *
 * type FunctionParameters = OverloadParameters<typeof someFunction>; // 42[] | string[]
 * ```
 */
export type OverloadParameters<T extends ((...args: unknown[]) => unknown)[]> = ExtractMoreSpecificTypes<{
	[K in keyof T]: Parameters<Overloads<T[K]>>;
}>;
