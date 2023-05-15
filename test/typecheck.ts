/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
	* Typechecker Tests!
	*/

import * as assert from 'assert';
import { Parser } from '../src';
import * as Compiler from '../src/compiler/node';
import { BoolT, NullT, NumT, StrT, Type, TypeVar } from '../src/compiler/type';
import * as Index from '../src/compiler/index';

const typecheckTest = (program: string): Compiler.Node[] => {
	const parser = new Parser();
	const ast = parser.parse(program);
	const checked = Index.typeCheck(ast);
	return checked;

};

const eq = (a: Compiler.Node, b: Type): void => {
	if ('etype' in a) {
		assert.deepStrictEqual(a.etype, b);
	}
};

const assertTypeVar = (a: Type): void => {
	assert.equal(a.type, 'typeVar');
};

test.concurrent('number literal', async () => {
	const res = typecheckTest('1');
	eq(res[0]!, NumT);
});

test.concurrent('math', async () => {
	const res = typecheckTest('1+1');
	assert.deepEqual((res[0] as any).etype, NumT);
	assert.deepEqual((res[0] as any).target.etype, { type: 'fnType', args: [NumT, NumT], ret: NumT });
});

test.concurrent('bool literal', async () => {
	const trueRes = typecheckTest('true');
	eq(trueRes[0]!, BoolT);
	const falseRes = typecheckTest('false');
	eq(falseRes[0]!, BoolT);
});

test.concurrent('string literal', async () => {
	const res = typecheckTest('"hello"');
	eq(res[0]!, StrT);
});

test.concurrent('null literal', async () => {
	const res = typecheckTest('null');
	eq(res[0]!, NullT);
});

test.concurrent('fn with type decl', async () => {
	const res = typecheckTest(`
	@f(x:num):num {return x}
	f(1)
		`);
	(res[0] as any).expr.args.map((arg: { etype: Type; }) => assert.deepEqual(arg.etype, NumT));
	assert.deepEqual((res[0] as any).expr.args[0]!.etype, NumT);
	assert.deepEqual((res[0] as any).expr.etype, { type: 'fnType', args: [NumT], ret: NumT });

	assertTypeVar((res[0] as any).etype);
	assert.deepEqual((res[1] as any).args[0]!.etype, NumT);
});

test.concurrent('fn with many type decls', async () => {
	const res = typecheckTest(`
	@f(x:num, y:num):num { return x+y }
	f(1, 3)
		`);
	(res[0] as any).expr.args.map((arg: { etype: Type; }) => assert.deepEqual(arg.etype, NumT));
	assert.deepEqual((res[0] as any).expr.args[0]!.etype, NumT);
	assert.deepEqual((res[0] as any).expr.args[1]!.etype, NumT);
	assert.deepEqual((res[0] as any).expr.etype, { type: 'fnType', args: [NumT, NumT], ret: NumT });

	assertTypeVar((res[1] as any).etype);
	assertTypeVar((res[1] as any).target.etype);
	assert.deepEqual((res[1] as any).args.map((arg: { etype: Type; }) => arg.etype), [NumT, NumT]);
});

test.concurrent('fn', async () => {
	const res = typecheckTest(
		`@f(x) {return x}
		f(1)
		`);
	assertTypeVar((res[0] as any).expr.args[0]!.etype);
	assert.deepEqual((res[0] as any).expr.etype.type, 'fnType');
	assert.deepEqual((res[1] as any).args[0]!.etype, NumT);
});

