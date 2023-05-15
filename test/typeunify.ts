
import { FnType, genTypeVar, NumT } from '../src/compiler/type';
import { Unifyer, UnionFind } from '../src/compiler/typeunify';
import * as assert from 'assert';


test.concurrent('union-find', async () => {

	const t0 = genTypeVar();
	const t1 = genTypeVar();
	const t2 = genTypeVar();

	const uf = new UnionFind();

	uf.union(t0, t1);
	uf.union(t1, t2);

	assert.equal(uf.find(t0), uf.find(t2));
	assert.equal(uf.find(t1), uf.find(t2));
});

test.concurrent('union-find(inverse union order)', async () => {

	const t0 = genTypeVar();
	const t1 = genTypeVar();
	const t2 = genTypeVar();

	const uf = new UnionFind();

	uf.union(t1, t2);
	uf.union(t0, t1);

	assert.equal(uf.find(t0), uf.find(t2));
	assert.equal(uf.find(t1), uf.find(t2));
});

test.concurrent('unify tvar', async () => {

	const t0 = genTypeVar();
	const t1 = genTypeVar();
	const t2 = genTypeVar();

	const unifyer = new Unifyer();

	unifyer.unify(t0, t1);
	unifyer.unify(t1, t2);

	assert.equal(unifyer.getInferenced(t0), unifyer.getInferenced(t2));
	assert.equal(unifyer.getInferenced(t1), unifyer.getInferenced(t2));
});

test.concurrent('unify namedType', async () => {
	const t0 = genTypeVar();
	const t1 = genTypeVar();
	const t2: NumT = NumT;

	const unifyer = new Unifyer();
	unifyer.unify(t0, t1);
	unifyer.unify(t2, t1);

	assert.equal(unifyer.getInferenced(t0), NumT);
	assert.equal(unifyer.getInferenced(t1), NumT);
});

test.concurrent('unify fn ', async () => {

	const t0 = genTypeVar();
	const t1 = genTypeVar();
	const t2: FnType = { type: 'fnType', args: [genTypeVar()], ret: genTypeVar() };

	const unifyer = new Unifyer();

	unifyer.unify(t0, t1);
	unifyer.unify(t1, t2);

	assert.equal(unifyer.getInferenced(t0).type, 'fnType');
	assert.equal(unifyer.getInferenced(t1).type, 'fnType');

});
test.concurrent('unify fn (should fail on finalize)', async () => {

	const t0 = genTypeVar();
	const t1 = genTypeVar();
	const t2: FnType = { type: 'fnType', args: [t0, t1], ret: t0 };

	const unifyer = new Unifyer();

	unifyer.unify(t0, t1);
	unifyer.unify(t1, t2);
	console.log(unifyer.getInternalUF());

	assert.equal(unifyer.getInferenced(t0), unifyer.getInferenced(t2));
	assert.equal(unifyer.getInferenced(t1), unifyer.getInferenced(t2));

});
