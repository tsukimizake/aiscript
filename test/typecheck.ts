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
	const initTypedNode = Compiler.fromAsts(ast);
	return initTypedNode;
};

const eq = (a: Compiler.Node, b: Compiler.Type): void => {
	if ('etype' in a) {
		assert.deepStrictEqual(a.etype, b);
	}
};

const typeVarEq = (a: Compiler.TypeVar, b: Compiler.TypeVar): void => {
	assertTypeVar(a);
	assertTypeVar(b);
	assert.deepStrictEqual(a, b);
};
const assertTypeVar = (a: Compiler.Type): void => {
	assert.equal(a.type, 'typeVar');
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

test.concurrent('fn with type decl', async () => {
	const res = tryinit('@f(x:num):num {return x}');
	(res[0] as any).expr.args.map((arg: { etype: Compiler.Type; }) => assert.deepEqual(arg.etype, Compiler.NumT));
	assert.deepEqual((res[0] as any).expr.args[0]!.etype, Compiler.NumT);
	assert.deepEqual((res[0] as any).expr.etype, { type: 'fnType', args: [Compiler.NumT], return: Compiler.NumT });
});

test.concurrent('fn', async () => {
	const res = tryinit('@f(x) {return x}');
	assertTypeVar((res[0] as any).expr.args[0]!.etype);
	assert.deepEqual((res[0] as any).expr.etype.type, 'fnType');
});
