import type * as Ast from '../node';
import { builtInTypes } from './builtins';
import type { Node } from './node';
import * as CompilerNode from './node';
import { FnType, genTypeVar } from './type';
import { Unifyer } from './typeunify';
import { visitNodes } from './visitnode';

type Context = {
	unifyer: Unifyer;
}

const initContext: Context = {
	unifyer: new Unifyer()
};

export function typeCheck(input: Ast.Node[]): Node[] {
	const initial = CompilerNode.fromAsts(input);

	visitNodes({ val: initContext }, initial, unifyVisitor);

	console.log(initContext.unifyer.getInternalUF());
	return visitNodes({ val: initContext }, initial, finalizeTypeCheck);
}

function unifyVisitor(ctx: Context, node: CompilerNode.Expression): CompilerNode.Expression {
	console.log(node.type);
	switch (node.type) {
		case 'call': {

			const targetType = ctx.unifyer.getInfered(node.target.etype);

			if (targetType.type !== 'fnType') {
				throw new Error(`type error: ${node.target.etype} is not fnType`);
			}

			const fnType: FnType = { type: 'fnType', args: node.args.map((_) => { return genTypeVar(); }), ret: genTypeVar() };
			ctx.unifyer.unify(fnType.ret, node.etype);
			ctx.unifyer.unify(targetType, fnType);

			if (node.args.length !== targetType.args.length) {
				throw new Error(`type error: arity of ${node.target.etype} is not matched with ${node.args}`);
			}

			for (let i = 0; i < node.args.length; i++) {
				ctx.unifyer.unify(node.args[i]!.etype, targetType.args[i]!);
			}

			return { ...node };
		}
		case 'identifier': {
			const builtin = builtInTypes.get(node.name)
			if (builtin) {
				ctx.unifyer.unify(node.etype, builtin);
				return { ...node, etype: builtin };
			}
			else { return node; }
		}

		default:
			return node;
	}
}

function finalizeTypeCheck(ctx: Context, node: CompilerNode.Expression): CompilerNode.Expression {
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
