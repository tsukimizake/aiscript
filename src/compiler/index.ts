import type * as Ast from '../node';
import type { Node } from './node';
import * as CompilerNode from './node';

export function typeCheck(input: Ast.Node[]): Node[] {
	const initial = CompilerNode.fromAsts(input);
	return initial;


}	
