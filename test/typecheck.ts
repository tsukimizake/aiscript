/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
	* Typechecker Tests!
	*/

import * as assert from 'assert';
import { Parser } from '../src';
import * as Compiler from '../src/compiler/node';

const tryinit = (program: string): Compiler.Node[] => {
	const parser = new Parser();
	const ast = parser.parse(program);
	console.log(ast);
	const initTypedNode = Compiler.fromAsts(ast);
	return initTypedNode;
};

const eq = (a: Compiler.Node, b: Compiler.Type): void => {
	if ('etype' in a) {
		assert.deepStrictEqual(a.etype, b);
	}
};

test.concurrent('number literal', async () => {
	const res = tryinit('1');
	eq(res[0]!, Compiler.NumT);
});

test.concurrent('bool literal', async () => {
	const trueRes = tryinit('true');
	eq(trueRes[0]!, Compiler.BoolT);
	const falseRes = tryinit('false');
	eq(falseRes[0]!, Compiler.BoolT);
});

test.concurrent('string literal', async () => {
	const res = tryinit('"hello"');
	eq(res[0]!, Compiler.StrT);
});

test.concurrent('null literal', async () => {
	const res = tryinit('null');
	eq(res[0]!, Compiler.NullT);
});
