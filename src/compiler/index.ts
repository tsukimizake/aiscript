import type * as Ast from '../node';
import type { Node } from './node';
import * as CompilerNode from './node';
import { FnType } from './type';
import { unify } from './typeunify';
import { visitNodes } from './visitnode';

type Context = {}

const initContext: Context = {};

export function typeCheck(input: Ast.Node[]): Node[] {
	const initial = CompilerNode.fromAsts(input);
	return visitNodes({ val: initContext }, initial, f);
}

function f(_ctx: Context, node: CompilerNode.Expression): CompilerNode.Expression {
	switch (node.type) {
		case 'call': {
			unify(node.target, { etype: (node.etype as FnType).ret });

			if (node.args.length != (node.etype as FnType).args.length) { throw new Error('Argument length mismatch.'); }
			for (let i = 0; i < node.args.length; i += 1) {
				unify(node.args[i]!, { etype: (node.etype as FnType).args[i]! });
			}

			return node;
		}
		default:
			throw new Error('Function not implemented.');
	}
}

