
/* eslint-disable prefer-const */
/**
 *  Typechecker Tests!
 */

import * as assert from 'assert';
import { Parser, utils, errors, Ast, Cst } from '../src';
import { TypeSource, LiteralType, BuiltinType } from '../src/node';

const tryparse = (program: string): Ast.Node[] => {
	const parser = new Parser();
	const ast = parser.parse(program);
	return ast;
}



const eq = (a: Ast.Node, b: TypeSource): void => {
	if ('retType' in a) {
		assert.deepEqual(a.retType, b);
	} else if ('varType' in a) {
		assert.deepEqual(a.varType, b);
	} {
		assert(false, "no retType");
	}
};



test.concurrent('number literal', async () => {
	const res = tryparse("let a: num = 1");
	console.log(res);
	eq(res[0], BuiltinType('num'));
});
