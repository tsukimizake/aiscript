import type * as Ast from '../node.js';
// Ast.Nodeとの差分
// - typeをNodeから分離し、loc等を消す
// aiscriptの意味論上の型をetypeフィールドに持たせる。typeフィールドと被る場合はあるが区別する
// - Fnの型がargsとreturnに分かれているのもFnTypeにまとめる
// ImplicitAnyとExplicitAnyを区別する。
// - ImplicitAny(TypeVar)が型推論完了時に残っていた場合はエラーにするという仕様で行きたい。
// - ExplicitAnyに関してはバリデーションを行うようなコードを生成する。

export type Loc = {
	start: number;
	end: number;
};

export type Node = Namespace | Meta | Statement | Expression;

export type Statement =
	Definition |
	Return |
	Each |
	For |
	Loop |
	Break |
	Continue |
	Assign |
	AddAssign |
	SubAssign;

const statementTypes = [
	'def', 'return', 'each', 'for', 'loop', 'break', 'continue', 'assign', 'addAssign', 'subAssign',
];
export function isStatement(x: Node): x is Statement {
	return statementTypes.includes(x.type);
}

export type Expression =
	If |
	Fn |
	Match |
	Block |
	Tmpl |
	Str |
	Num |
	Bool |
	Null |
	Obj |
	Arr |
	Not |
	Identifier |
	Call |
	Index |
	Prop;

const expressionTypes = [
	'if', 'fn', 'match', 'block', 'tmpl', 'str', 'num', 'bool', 'null', 'obj', 'arr', 'identifier', 'call', 'index', 'prop',
];

export function isExpression(x: Node): x is Expression {
	return expressionTypes.includes(x.type);
}

type NodeBase = {
	loc?: { // コード位置
		start: number;
		end: number;
	};
};

export type Namespace = NodeBase & {
	type: 'ns'; // 名前空間
	name: string; // 空間名
	members: (Definition | Namespace)[]; // メンバー
};

export type Meta = NodeBase & {
	type: 'meta'; // メタデータ定義
	name: string | null; // 名
	value: Expression; // 値
};

export type Definition = NodeBase & {
	type: 'def'; // 変数宣言文
	name: string; // 変数名
	expr: Expression; // 式
	mut: boolean; // ミュータブルか否か
	attr: Attribute[]; // 付加された属性
};

export type Attribute = NodeBase & {
	type: 'attr'; // 属性
	name: string; // 属性名
	value: Expression; // 値
};

export type Return = NodeBase & {
	type: 'return'; // return文
	expr: Expression; // 式
};

export type Each = NodeBase & {
	type: 'each'; // each文
	var: string; // イテレータ変数名
	items: Expression; // 配列
	for: Statement | Expression; // 本体処理
};

export type For = NodeBase & {
	type: 'for'; // for文
	var?: string; // イテレータ変数名
	from?: Expression; // 開始値
	to?: Expression; // 終値
	times?: Expression; // 回数
	for: Statement | Expression; // 本体処理
};

export type Loop = NodeBase & {
	type: 'loop'; // loop文
	statements: (Statement | Expression)[]; // 処理
};

export type Break = NodeBase & {
	type: 'break'; // break文
};

export type Continue = NodeBase & {
	type: 'continue'; // continue文
};

export type AddAssign = NodeBase & {
	type: 'addAssign'; // 加算代入文
	dest: Expression; // 代入先
	expr: Expression; // 式
};

export type SubAssign = NodeBase & {
	type: 'subAssign'; // 減算代入文
	dest: Expression; // 代入先
	expr: Expression; // 式
};

export type Assign = NodeBase & {
	type: 'assign'; // 代入文
	dest: Expression; // 代入先
	expr: Expression; // 式
};

export type Not = NodeBase & {
	type: 'not'; // 否定
	etype: { type: 'fn', args: [BoolT], return: BoolT };
	expr: Expression; // 式
};

export type If = NodeBase & {
	type: 'if'; // if式
	etype: Type; // 戻り値の型
	cond: Expression; // 条件式
	then: Statement | Expression; // then節
	elseif: {
		cond: Expression; // elifの条件式
		then: Statement | Expression;// elif節
	}[];
	else?: Statement | Expression; // else節
};

export type Fn = NodeBase & {
	type: 'fn'; // 関数
	args: {
		name: string; // 引数名
		etype: Type; // 引数の型
	}[];
	etype: Type; // 戻り値の型
	children: (Statement | Expression)[]; // 本体処理
};

export type Match = NodeBase & {
	type: 'match'; // パターンマッチ
	etype: Type;
	about: Expression; // 対象
	qs: {
		q: Expression; // 条件
		a: Statement | Expression; // 結果
	}[];
	default?: Statement | Expression; // デフォルト値
};

export type Block = NodeBase & {
	type: 'block'; // ブロックまたはeval式
	etype: Type;
	statements: (Statement | Expression)[]; // 処理
};

export type Tmpl = NodeBase & {
	type: 'tmpl'; // テンプレート
	etype: Type;
	tmpl: (string | Expression)[]; // 処理
};

export type Str = NodeBase & {
	type: 'str'; // 文字列リテラル
	etype: StrT;
	value: string; // 文字列
};

export type Num = NodeBase & {
	type: 'num'; // 数値リテラル
	etype: NumT;
	value: number; // 数値
};

export type Bool = NodeBase & {
	type: 'bool'; // 真理値リテラル
	etype: BoolT;
	value: boolean; // 真理値
};

export type Null = NodeBase & {
	type: 'null'; // nullリテラル
	etype: NullT;
};

// objの型については悩んでいる
// コンパイル後のコードでフィールドアクセスが毎回ハッシュテーブルへのアクセスになるのは(wasm処理系のJITコンパイラの賢さによるが)かなり遅いと思われる。
// 可能な限りどのようなフィールドを持つかを推論し、推論不能な部分をテーブル化するような形にしたい。
export type Obj = NodeBase & {
	type: 'obj'; // オブジェクト
	etype: ObjT; // TODO ちゃんとした推論をするかも?
	initValue: Map<string, Expression>; // 初期化時の値を持っておくのは推論に有用なはず
};

export type Arr = NodeBase & {
	type: 'arr'; // 配列
	etype: Type;
	value: Expression[]; // アイテム
};

export type Identifier = NodeBase & {
	type: 'identifier'; // 変数などの識別子
	etype: Type;
	name: string; // 変数名
};

// chain node example:
// call > fn
// call > var(fn)
// index > arr
// index > var(arr)
// prop > prop(obj) > var(obj)
// call > prop(fn) > obj

export type Call = NodeBase & {
	type: 'call'; // 関数呼び出し
	etype: Type;
	target: Expression; // 対象
	args: Expression[]; // 引数
};

export type Index = NodeBase & {
	type: 'index'; // 配列要素アクセス
	etype: Type;
	target: Expression; // 対象
	index: Expression; // インデックス
};

export type Prop = NodeBase & {
	type: 'prop'; // プロパティアクセス
	etype: Type;
	target: Expression; // 対象
	name: string; // プロパティ名
};

// Type source

export type Type = NamedType<string> | FnType | TypeVar;


export type NamedType<name extends string> = {
	type: 'namedType'; // 名前付き型
	name: name; // 型名
	inner: Type[]; // 内側の型
};

export type FnType = {
	type: 'fnType'; // 関数の型
	args: Type[];
	return: Type;
};

export type TypeVar = {
	type: 'typeVar';
	name: string;
}

let typeVarCounter: number = 0;
function genTypeVar(): TypeVar {
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

export function fromAsts(input: Ast.Node[]): Node[] {
	return input.map((input) => fromAst(input));
}

// Ast.Nodeとの差分
// - typeをNodeから分離し、loc等を消す
// - etype(expressionTypeの略)を追加。自明なリテラル以外はTypeVarを一旦入れて後で推論していく
// - Fnの型がargTypeとretTypeに分かれているのをFnTypeSourceにまとめる
function fromAst(input: Ast.Node): Node {
	if (expressionTypes.includes(input.type)) {
		return fromAstExpr(input as Ast.Expression);
	} else if (statementTypes.includes(input.type)) {
		return fromStatement(input as Ast.Statement);
	} else {
		throw new TypeError(`TODO: node type: ${input.type}`);
	}
}

function fromStatement(input: Ast.Statement): Statement {
	switch (input.type) {
		case 'def':
			return { type: input.type, name: input.name, expr: fromAstExpr(input.expr), mut: input.mut, attr: input.attr.map((attr) => fromAstAttr(attr)) };
		case 'return':
			return { type: input.type, expr: fromAstExpr(input.expr) };

		default:
			throw new TypeError(`TODO: statement type: ${input.type}`);
	}
}

function fromAstExpr(input: Ast.Expression): Expression {
	switch (input.type) {
		case 'num':
			return { type: 'num', etype: NumT, value: input.value };
		case 'bool':
			return { type: 'bool', etype: BoolT, value: input.value };
		case 'str':
			return { type: 'str', etype: StrT, value: input.value };
		case 'null':
			return { type: 'null', etype: NullT };
		case 'obj': {
			const values = new Map<string, Expression>();
			for (const [k, v] of input.value) {
				values.set(k, fromAstExpr(v));
			}
			return { type: 'obj', etype: ObjT, initValue: values };
		}
		case 'fn': {
			const args = input.args.map(({ name, argType }) => {
				const eType = (argType === null) ? genTypeVar() : fromAstTypeSource(argType);
				return { type: 'arg', name, etype: eType };
			});

			const retType = (input.retType === null) ? genTypeVar() : fromAstTypeSource(input.retType);

			const fnType: FnType = { type: 'fnType', args: args.map((arg) => arg.etype), return: retType };

			const children: Statement[] = input.children.map((child) => {
				if (expressionTypes.includes(child.type)) {
					return { type: 'return', expr: fromAstExpr(child as Ast.Expression) };
				} else {
					return fromStatement(child as Ast.Statement);
				}
			})

			return {
				type: 'fn', args, etype: fnType, children,
			};
		}

		case 'call':
			return { type: 'call', etype: genTypeVar(), target: fromAstExpr(input.target), args: input.args.map((arg) => fromAstExpr(arg)) };
		case 'identifier':
			return { type: input.type, etype: genTypeVar(), name: input.name };
		default:
			throw new TypeError(`TODO: expression type: ${input.type}`);
	}
}

function fromAstAttr(input: Ast.Attribute): Attribute {
	return { type: input.type, name: input.name, value: fromAstExpr(input.value) };
}


function fromAstTypeSource(input: Ast.TypeSource): Type {
	switch (input.type) {
		case 'namedTypeSource':
			if (input.inner === null) {
				return { type: 'namedType', name: input.name, inner: [] };
			} else {
				return { type: 'namedType', name: input.name, inner: [fromAstTypeSource(input.inner)] };
			}
		case 'fnTypeSource':
			return { type: 'fnType', args: input.args.map((arg) => fromAstTypeSource(arg)), return: fromAstTypeSource(input.result) };
	}
}
