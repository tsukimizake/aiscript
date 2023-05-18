import type * as Type from './type';
import { NumT } from './type';

// TODO /lib/std.tsなどでまとめて定義する形に変更
export const builtInTypes: Map<string, Type.Type> = new Map([
	['Core:add', { type: 'fnType', args: [NumT, NumT], ret: NumT }],
	['Core:sub', { type: 'fnType', args: [NumT, NumT], ret: NumT }],
	['Core:mul', { type: 'fnType', args: [NumT, NumT], ret: NumT }],
	['Core:pow', { type: 'fnType', args: [NumT, NumT], ret: NumT }],
]);
