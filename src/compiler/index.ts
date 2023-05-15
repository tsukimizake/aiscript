import type * as Ast from '../node';
import { builtInTypes } from './builtins';
import type { Node } from './node';
import * as CompilerNode from './node';
import { FnType, genTypeVar, Type } from './type';
import { Unifyer } from './typeunify';
import { visitNodes } from './visitnode';

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

		visitNodes({ val: { unifyer: this.unifyer, nameTable: this.nameTable } }, initial, this.unifyVisitor);

		return visitNodes({ val: { unifyer: this.unifyer, nameTable: this.nameTable } }, initial, this.finalizeTypeCheck);
	}

	unifyVisitor(ctx: Context, node: CompilerNode.Node): CompilerNode.Node {
		switch (node.type) {
			case 'call': {

				const targetType = ctx.unifyer.getInfered(node.target.etype);


				const fnType: FnType = { type: 'fnType', args: node.args.map((_) => { return genTypeVar(); }), ret: genTypeVar() };
				ctx.unifyer.unify(fnType.ret, node.etype);
				ctx.unifyer.unify(targetType, fnType);

				return node;
			}
			case 'identifier': {
				const builtin = builtInTypes.get(node.name)
				if (builtin) {
					ctx.unifyer.unify(node.etype, builtin);
					return { ...node, etype: builtin };
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

	finalizeTypeCheck(ctx: Context, node: CompilerNode.Expression): CompilerNode.Expression {
		switch (node.type) {
			case 'str':
			case 'num':
			case 'bool':
			case 'null':
			case 'obj':
			case 'not':
				return node;
			default:
				return { ...node, etype: ctx.unifyer.getInfered(node.etype) };
		}

	}
}




