import type * as Ast from '../node';
import { builtInTypes } from './builtins';
import type { Node } from './node';
import * as CompilerNode from './node';
import { FnType, genTypeVar, Type } from './type';
import { Unifyer } from './typeunify';
import { visitNodesOuterFirst } from './visitnode';

type Context = {
	unifyer: Unifyer,
	nameTable: Map<string, Type>
};
export class TypeChecker {
	unifyer: Unifyer;
	nameTable: Map<string, Type>;
	constructor() {
		this.unifyer = new Unifyer();
		this.nameTable = new Map<string, Type>();
	};
	public typeCheck(input: Ast.Node[]): Node[] {
		const initial = CompilerNode.fromAsts(input);

		visitNodesOuterFirst({ val: { unifyer: this.unifyer, nameTable: this.nameTable } }, initial, this.unifyVisitor);

		return visitNodesOuterFirst({ val: { unifyer: this.unifyer, nameTable: this.nameTable } }, initial, this.setInferedType);
	}

	unifyVisitor(ctx: Context, node: CompilerNode.Node): CompilerNode.Node {
		switch (node.type) {
			case 'call': {


				const fnType: FnType = { type: 'fnType', args: node.args.map((_) => { return genTypeVar(); }), ret: genTypeVar() };
				ctx.unifyer.unify(fnType.ret, node.etype);
				ctx.unifyer.unify(fnType, node.target.etype);
				fnType.args.map((arg, i) => ctx.unifyer.unify(arg, node.args[i]!.etype));

				return node;
			}
			case 'identifier': {
				const builtin = builtInTypes.get(node.name)

				if (builtin) {
					ctx.unifyer.unify(node.etype, builtin);
					return node;
				}

				const type = ctx.nameTable.get(node.name);
				if (type) {
					ctx.unifyer.unify(node.etype, type);
				}

				return node;
			}

			case 'def': {
				const name = node.name;
				const typeOfSameSymbol = ctx.nameTable.get(name);
				if (typeOfSameSymbol === undefined) {
					ctx.nameTable.set(name, node.expr.etype);
					return node;
				} else {
					ctx.unifyer.unify(typeOfSameSymbol, node.expr.etype);
				}
				return node;
			}

			default:
				return node;
		}
	}

	setInferedType(ctx: Context, node: CompilerNode.Node): CompilerNode.Node {
		switch (node.type) {
			case 'str':
			case 'num':
			case 'bool':
			case 'null':
			case 'obj':
			case 'not':
				return node;
			default:
				if ('etype' in node) {
					return { ...node, etype: ctx.unifyer.getInfered(node.etype) };
				} else {
					return node;
				}
		}

	}
}
