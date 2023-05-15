import * as assert from 'assert';
import { Parser } from '../src';
import * as Compiler from '../src/compiler/node';
import { BoolT, NullT, NumT, StrT, Type, TypeVar } from '../src/compiler/type';
import * as Index from '../src/compiler/index';

const typecheckTest = (program: string): Compiler.Node[] => {
	const parser = new Parser();
	const ast = parser.parse(program);
	const typeChecker = new Index.TypeChecker();
	const checked = typeChecker.typeCheck(ast);
	return checked;

};

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
