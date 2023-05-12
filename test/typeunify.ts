
import { genTypeVar, TypeVar } from '../src/compiler/type';
import { Unifyer } from '../src/compiler/typeunify';
import * as assert from 'assert';


test.concurrent('union-find', async () => {

	const e0 = genTypeVar();
	const e1 = genTypeVar();
	const e2 = genTypeVar();

	const unifyer = new Unifyer();

	unifyer.union(e0, e1);
	unifyer.union(e1, e2);

	assert.equal(unifyer.find(e0), unifyer.find(e2));
	assert.equal(unifyer.find(e1), unifyer.find(e2));
});

test.concurrent('union-find(inverse union order)', async () => {

	const e0 = genTypeVar();
	const e1 = genTypeVar();
	const e2 = genTypeVar();

	const unifyer = new Unifyer();

	unifyer.union(e1, e2);
	unifyer.union(e0, e1);

	assert.equal(unifyer.find(e0), unifyer.find(e2));
	assert.equal(unifyer.find(e1), unifyer.find(e2));
});
test.concurrent('unify tvar', async () => {

	const e0 = genTypeVar();
	const e1 = genTypeVar();
	const e2 = genTypeVar();

	const unifyer = new Unifyer();

	unifyer.unify(e0, e1);
	unifyer.unify(e1, e2);

	assert.equal(unifyer.find(e0), unifyer.find(e2));
	assert.equal(unifyer.find(e1), unifyer.find(e2));
});


test.concurrent('unify fn', async () => {

});
