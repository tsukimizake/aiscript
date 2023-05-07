import * as Types from './type';

// e1:T1, e2:T1, e3:numのときに、unify(e1, e3)したらe2にも伝播してe1,e2,e3全てnumになる動作にしたい
// そのために参照を活用する
// TODO エラー時loc表示
export function unify(lhs: { etype: Types.Type }, rhs: { etype: Types.Type }): void {
	// 参照が同じなら何もしない
	if (lhs.etype === rhs.etype) return;

	// どちらかがTypeVarなら参照を統一する
	if (lhs.etype.type === 'typeVar') {
		lhs.etype = rhs.etype;
		return;
	}
	if (rhs.etype.type === 'typeVar') {
		rhs.etype = lhs.etype;
		return;
	}

	// 両方ともnamedTypeなら、名前の一致を確認してinnerをunify
	if (lhs.etype.type === 'namedType' && rhs.etype.type === 'namedType') {
		if (lhs.etype.name === rhs.etype.name) {
			unifyNamedTypeInners(lhs.etype, rhs.etype);
			return;
		} else {
			throw new TypeError(`型が一致しません。${lhs.etype.name}と${rhs.etype.name}は一致しません。`);
		}
	}

	// 両方ともfnTypeなら、argsとretの型をunifyして、一致していればOK
	if (lhs.etype.type === 'fnType' && rhs.etype.type === 'fnType') {
		if (lhs.etype.args.length === rhs.etype.args.length) {
			for (let i = 0; i < lhs.etype.args.length; i++) {
				unify({ etype: lhs.etype.args[i]! }, { etype: rhs.etype.args[i]! });
			}
			unify({ etype: lhs.etype.ret }, { etype: rhs.etype.ret });
			return;
		} else {
			throw new TypeError(`引数の数が一致しません。${lhs.etype.args.length}と${rhs.etype.args.length}は一致しません。`);
		}
	}

	// 片方typesschemeなら、forallの型を新しいTypeVarに置き換えてunify
	if (lhs.etype.type === 'typeScheme') {
		const lhsType = instanciateTypeScheme(lhs.etype);
		unify({ etype: lhsType }, rhs);
	}
	if (rhs.etype.type === 'typeScheme') {
		const rhsType = instanciateTypeScheme(rhs.etype);
		unify(lhs, { etype: rhsType });
	}

	throw new Error(`unify failed! ${lhs.etype} and ${rhs.etype}`);
}

function unifyNamedTypeInners(lhs: Types.NamedType<string>, rhs: Types.NamedType<string>) {
	if (lhs.inner.length === rhs.inner.length) {
		for (let i = 0; i < lhs.inner.length; i++) {
			unify({ etype: lhs.inner[i]! }, { etype: rhs.inner[i]! });
		}
	} else {
		throw new TypeError(`型引数の数が一致しません。${lhs.inner.length}と${rhs.inner.length}は一致しません。`);
	}
}

function instanciateTypeScheme(etype: Types.TypeScheme): Types.Type {
	// ここでは元のetypeに影響を与えないようにする
	let res = { ...etype.t };
	for (const typeVar of etype.forall) {
		const newTV = Types.genTypeVar();
		res = replaceTypeVar(res, typeVar, newTV);
	}
	return res;
}

function replaceTypeVar(t: Types.Type, typeVar: Types.TypeVar, newTV: Types.TypeVar): Types.Type {
	if (t.type === 'typeVar') {
		if (t.name === typeVar.name) {
			return newTV;
		} else {
			return t;
		}
	} else if (t.type === 'namedType') {
		return {
			type: 'namedType',
			name: t.name,
			inner: t.inner.map((inner) => replaceTypeVar(inner, typeVar, newTV)),
		};
	} else if (t.type === 'fnType') {
		return {
			type: 'fnType',
			args: t.args.map((arg) => replaceTypeVar(arg, typeVar, newTV)),
			ret: replaceTypeVar(t.ret, typeVar, newTV),
		};
	} else if (t.type === 'typeScheme') {
		// TODO test
		const t1 = instanciateTypeScheme(t);
		return replaceTypeVar(t1, typeVar, newTV);
	} else {
		throw new Error(`replaceTypeVar failed! ${t}`);
	}
}
