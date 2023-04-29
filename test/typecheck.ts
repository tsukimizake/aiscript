
/* eslint-disable prefer-const */
/**
 *  Typechecker Tests!
 */

import * as assert from 'assert';
import { Parser, Ast, } from '../src';
import * as Compiler from '../src/compiler/node';

const tryparse = (program: string): Ast.Node[] => {
	const parser = new Parser();
	const ast = parser.parse(program);
	return ast;
}



const eq = (a: Compiler.Node, b: Compiler.TypeSource): void => {
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
});

