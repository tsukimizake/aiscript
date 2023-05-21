import { TypeChecker } from './typecheck';
import type { Node } from './node';
import type * as Ast from '../node';

export function compile(input: Ast.Node[]): Node[] {
	const typeChecker = new TypeChecker();
	return typeChecker.typeCheck(input);
}
