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

test.concurrent('fn with type decl', async () => {
	const res = typecheckTest(`
	@f(x:num):num {return x}
	f(1)
		`);
	(res[0] as any).expr.args.map((arg: { etype: Type; }) => assert.deepEqual(arg.etype, NumT));
	assert.deepEqual((res[0] as any).expr.args[0]!.etype, NumT);
	assert.deepEqual((res[0] as any).expr.etype, { type: 'fnType', args: [NumT], ret: NumT });

	assert.deepEqual((res[1] as any).args[0]!.etype, NumT);
});
