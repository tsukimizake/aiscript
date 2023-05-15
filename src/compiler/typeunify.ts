import * as Types from './type';
import deepEqual from "deep-equal";
import type { Type, TypeScheme, TypeVar } from './type';

// e1:T1, e2:T1, e3:numのときに、unify(e1, e3)したらe2にも伝播してe1,e2,e3全てnumになる動作にしたい
// 型変数の同値関係をUnionFind木として得る
// TODO エラー時loc表示

export class UnionFind {
	constructor() {
		this.ufMap = new Map();
	}

	ufMap: Map<Type, Type>;

	public union(a: Type, b: Type): void {
		const aRoot = this.find(a);
		const bRoot = this.find(b);
		if (aRoot === bRoot) return;
		this.ufMap.set(aRoot, bRoot);
		this.ufMap.set(bRoot, bRoot);
	}

	public find(a: Type): Type {
		let parent = this.ufMap.get(a);

		while (true) {
			if (parent === undefined || parent === a) {
				return a;
			} else {
				// parentにさらにparentがある場合を再帰的に見に行って、見つけたらpath compression
				const res = this.find(parent);
				this.ufMap.set(a, res);
				return res;
			}
		}
	}
	public getInternalMap(): Map<Type, Type> {
		return this.ufMap;
	}
}

export class Unifyer {
	uf: UnionFind;
	public constructor() {
		this.uf = new UnionFind();
	}


	public getInfered(t: Type) {
		return this.uf.find(t);
	}
	public getInternalUF() {
		return this.uf.getInternalMap();
	}

	public unify(lhs: Type, rhs: Type): void {
		const lParent = this.uf.find(lhs);
		const rParent = this.uf.find(rhs);

		if (deepEqual(lParent, rParent)) return;

		// どちらかがTypeVarなら統一する
		if (lParent.type === 'typeVar') {
			this.uf.union(lhs, rhs);
			return;
		}
		if (rParent.type === 'typeVar') {
			return this.uf.union(rhs, lhs);
		}

		// 両方ともnamedTypeなら、名前の一致を確認してinnerをunify

		if (lParent.type === 'namedType' && rParent.type === 'namedType') {
			if (lParent.name === rParent.name) {
				this.unifyNamedTypeInners(lParent, rParent);
				return;
			} else {
				throw new TypeError(`型が一致しません。${lParent}と${rParent}は一致しません。`);
			}
		}

		// 両方ともfnTypeなら、argsとretの型をunifyして、一致していればOK
		if (lParent.type === 'fnType' && rParent.type === 'fnType') {
			if (lParent.args.length === rParent.args.length) {
				for (let i = 0; i < lParent.args.length; i++) {
					this.unify(lParent.args[i]!, rParent.args[i]!);
				}
				this.unify(lParent.ret, rParent.ret);
				return;
			} else {
				throw new TypeError(`${lParent.args}と${rParent.args}の引数の数が一致しません。`);
			}
		}

		// 片方typeschemeなら、forallの型を新しいTypeVarに置き換えてunify
		if (lParent.type === 'typeScheme') {
			const lParentType = this.instanciateTypeScheme(lParent);
			this.unify(lParentType, rParent);
		}
		if (rParent.type === 'typeScheme') {
			this.unify(rParent, lParent);
		}

		throw new Error(`unify failed! ${lParent} and ${rParent}`);
	}

	unifyNamedTypeInners(lhs: Types.NamedType<string>, rhs: Types.NamedType<string>) {
		if (lhs.inner.length === rhs.inner.length) {
			for (let i = 0; i < lhs.inner.length; i++) {
				this.unify(lhs.inner[i]!, rhs.inner[i]!);
			}
		} else {
			throw new TypeError(`${lhs.inner}と${rhs.inner}の型引数の数が一致しません。`);
		}
	}

	instanciateTypeScheme(scheme: TypeScheme): Type {
		// ここでは元のetypeに影響を与えないようにする
		let res: Type = scheme;
		for (const typeVar of scheme.forall) {
			const newTV = Types.genTypeVar();
			res = this.replaceTypeVar(res, typeVar, newTV);
		}
		return res;
	}

	replaceTypeVar(t: Type, typeVar: TypeVar, newTV: TypeVar): Type {
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
				inner: t.inner.map((inner) => this.replaceTypeVar(inner, typeVar, newTV)),
			};
		} else if (t.type === 'fnType') {
			return {
				type: 'fnType',
				args: t.args.map((arg) => this.replaceTypeVar(arg, typeVar, newTV)),
				ret: this.replaceTypeVar(t.ret, typeVar, newTV),
			};
		} else if (t.type === 'typeScheme') {
			// TODO test
			const t1 = this.instanciateTypeScheme(t);
			return this.replaceTypeVar(t1, typeVar, newTV);
		} else {
			throw new Error(`replaceTypeVar failed! ${t}`);
		}
	}
}
