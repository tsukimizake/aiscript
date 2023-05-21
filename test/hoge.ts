import * as assert from 'assert';
import { Parser } from '../src';
import * as Compiler from '../src/compiler/node';
import { NumT, Type } from '../src/compiler/type';
import { TypeChecker } from '../src/compiler/typecheck';

const typecheckTest = (program: string): Compiler.Node[] => {
	const parser = new Parser();
	const ast = parser.parse(program);
	const typeChecker = new TypeChecker();
	const checked = typeChecker.typeCheck(ast);
	return checked;

};

// test.concurrent('math', async () => {
// 	const res = typecheckTest('1+1');
// 	assert.deepEqual((res[0] as any).etype, NumT);
// 	assert.deepEqual((res[0] as any).target.etype, { type: 'fnType', args: [NumT, NumT], ret: NumT });
// });
test.concurrent('fn with many type decls', async () => {
	const res = typecheckTest(`
	@f(x:num, y:num):num { return x+y }
	f(1 3)
		`);
	(res[0] as any).expr.args.map((arg: { etype: Type; }) => assert.deepEqual(arg.etype, NumT));
	assert.deepEqual((res[0] as any).expr.args[0]!.etype, NumT);
	assert.deepEqual((res[0] as any).expr.args[1]!.etype, NumT);
	assert.deepEqual((res[0] as any).expr.etype, { type: 'fnType', args: [NumT, NumT], ret: NumT });

	assert.deepEqual((res[1] as any).args.map((arg: { etype: Type; }) => arg.etype), [NumT, NumT]);
});

// test.concurrent('fn with many type decls', async () => {
// 	const res = typecheckTest(`
// 	@f(x:num, y:num):num { return x+y }
// 	f(1 3)
// 		`);
// 	(res[0] as any).expr.args.map((arg: { etype: Type; }) => assert.deepEqual(arg.etype, NumT));
// 	assert.deepEqual((res[0] as any).expr.args[0]!.etype, NumT);
// 	assert.deepEqual((res[0] as any).expr.args[1]!.etype, NumT);
// 	assert.deepEqual((res[0] as any).expr.etype, { type: 'fnType', args: [NumT, NumT], ret: NumT });
// 
// 	console.log(res[1]);
// 	assert.deepEqual((res[1] as any).etype, NumT);
// 	assert.deepEqual((res[1] as any).target.etype, { type: 'fnType', args: [NumT, NumT], ret: NumT });
// 	assert.deepEqual((res[1] as any).args.map((arg: { etype: Type; }) => arg.etype), [NumT, NumT]);
// });
