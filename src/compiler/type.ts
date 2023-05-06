export type Type = NamedType<string> | FnType | TypeVar | TypeScheme;

export type NamedType<name extends string> = {
	type: 'namedType'; // 名前付き型
	name: name; // 型名
	inner: Type[]; // 内側の型
};

export type FnType = {
	type: 'fnType'; // 関数の型
	args: Type[];
	ret: Type;
};

export type TypeVar = {
	type: 'typeVar';
	name: string;
}

export type TypeScheme = {
	forall: TypeVar[];
	type: Type;
}

let typeVarCounter = 0;

export function genTypeVar(): TypeVar {
	const name = `T${typeVarCounter++}`;
	return { type: 'typeVar', name };
}

export type NumT = NamedType<'num'>;
export const NumT: NumT = builtInType('num');
export type BoolT = NamedType<'bool'>;
export const BoolT: BoolT = builtInType('bool');
export type StrT = NamedType<'str'>;
export const StrT: StrT = builtInType('str');
export type NullT = NamedType<'null'>;
export const NullT: NullT = builtInType('null');
export type ObjT = NamedType<'obj'>;
export const ObjT: ObjT = builtInType('obj');

function builtInType<name extends string>(name: name): NamedType<name> {
	return { type: 'namedType', name: name, inner: [] };
}

