import * as Node from './node';

export function visitNodesInnerFirst<T>(ctx: { val: T }, nodes: Node.Node[], fn: (c: T, node: Node.Node) => Node.Node): Node.Node[] {
	// ctxを更新しながら再帰的にvisitNodeを呼び出す
	return nodes.map(node => fn(ctx.val, visitNodeInnerFirst(ctx, node, fn)));
}
export function visitNodeInnerFirst<T>(ctx: { val: T }, node: Node.Node, fn: (c: T, node: Node.Node) => Node.Node): Node.Node {
	// nested nodes
	switch (node.type) {
		case 'def': {
			node.expr = fn(ctx.val, visitNodeInnerFirst(ctx, node.expr, fn)) as Node.Definition['expr'];
			break;
		}
		case 'return': {
			node.expr = fn(ctx.val, visitNodeInnerFirst(ctx, node.expr, fn)) as Node.Return['expr'];
			break;
		}
		case 'each': {
			node.items = fn(ctx.val, visitNodeInnerFirst(ctx, node.items, fn)) as Node.Each['items'];
			node.for = fn(ctx.val, visitNodeInnerFirst(ctx, node.for, fn)) as Node.Each['for'];
			break;
		}
		case 'for': {
			if (node.from != null) {
				node.from = fn(ctx.val, visitNodeInnerFirst(ctx, node.from, fn)) as Node.For['from'];
			}
			if (node.to != null) {
				node.to = fn(ctx.val, visitNodeInnerFirst(ctx, node.to, fn)) as Node.For['to'];
			}
			if (node.times != null) {
				node.times = fn(ctx.val, visitNodeInnerFirst(ctx, node.times, fn)) as Node.For['times'];
			}
			node.for = fn(ctx.val, visitNodeInnerFirst(ctx, node.for, fn)) as Node.For['for'];
			break;
		}
		case 'loop': {
			for (let i = 0; i < node.statements.length; i++) {
				node.statements[i] = fn(ctx.val, visitNodeInnerFirst(ctx, node.statements[i]!, fn)) as Node.Loop['statements'][number];
			}
			break;
		}
		case 'addAssign':
		case 'subAssign':
		case 'assign': {
			node.expr = fn(ctx.val, visitNodeInnerFirst(ctx, node.expr, fn)) as Node.Assign['expr'];
			node.dest = fn(ctx.val, visitNodeInnerFirst(ctx, node.dest, fn)) as Node.Assign['dest'];
			break;
		}
		case 'not': {
			node.expr = fn(ctx.val, visitNodeInnerFirst(ctx, node.expr, fn)) as Node.Return['expr'];
			break;
		}
		case 'if': {
			node.cond = fn(ctx.val, visitNodeInnerFirst(ctx, node.cond, fn)) as Node.If['cond'];
			node.then = fn(ctx.val, visitNodeInnerFirst(ctx, node.then, fn)) as Node.If['then'];
			for (const prop of node.elseif) {
				prop.cond = fn(ctx.val, visitNodeInnerFirst(ctx, prop.cond, fn)) as Node.If['elseif'][number]['cond'];
				prop.then = fn(ctx.val, visitNodeInnerFirst(ctx, prop.then, fn)) as Node.If['elseif'][number]['then'];
			}
			if (node.else != null) {
				node.else = fn(ctx.val, visitNodeInnerFirst(ctx, node.else, fn)) as Node.If['else'];
			}
			break;
		}
		case 'fn': {
			for (let i = 0; i < node.children.length; i++) {
				node.children[i] = fn(ctx.val, visitNodeInnerFirst(ctx, node.children[i]!, fn)) as Node.Fn['children'][number];
			}
			break;
		}
		case 'match': {
			node.about = fn(ctx.val, visitNodeInnerFirst(ctx, node.about, fn)) as Node.Match['about'];
			for (const prop of node.qs) {
				prop.q = fn(ctx.val, visitNodeInnerFirst(ctx, prop.q, fn)) as Node.Match['qs'][number]['q'];
				prop.a = fn(ctx.val, visitNodeInnerFirst(ctx, prop.a, fn)) as Node.Match['qs'][number]['a'];
			}
			if (node.default != null) {
				node.default = fn(ctx.val, visitNodeInnerFirst(ctx, node.default, fn)) as Node.Match['default'];
			}
			break;
		}
		case 'block': {
			for (let i = 0; i < node.statements.length; i++) {
				node.statements[i] = fn(ctx.val, visitNodeInnerFirst(ctx, node.statements[i]!, fn)) as Node.Block['statements'][number];
			}
			break;
		}
		case 'tmpl': {
			for (let i = 0; i < node.tmpl.length; i++) {
				const item = node.tmpl[i]!;
				if (typeof item !== 'string') {
					node.tmpl[i] = fn(ctx.val, visitNodeInnerFirst(ctx, item, fn)) as Node.Tmpl['tmpl'][number];
				}
			}
			break;
		}
		case 'arr': {
			for (let i = 0; i < node.value.length; i++) {
				node.value[i] = fn(ctx.val, visitNodeInnerFirst(ctx, node.value[i]!, fn)) as Node.Arr['value'][number];
			}
			break;
		}
		case 'call': {
			node.target = fn(ctx.val, visitNodeInnerFirst(ctx, node.target, fn)) as Node.Call['target'];
			for (let i = 0; i < node.args.length; i++) {
				node.args[i] = fn(ctx.val, visitNodeInnerFirst(ctx, node.args[i]!, fn)) as Node.Call['args'][number];
			}
			break;
		}
		case 'index': {
			node.target = fn(ctx.val, visitNodeInnerFirst(ctx, node.target, fn)) as Node.Index['target'];
			node.index = fn(ctx.val, visitNodeInnerFirst(ctx, node.index, fn)) as Node.Index['index'];
			break;
		}
		case 'prop': {
			node.target = fn(ctx.val, visitNodeInnerFirst(ctx, node.target, fn)) as Node.Prop['target'];
			break;
		}
		case 'ns': {
			for (let i = 0; i < node.members.length; i++) {
				node.members[i] = fn(ctx.val, visitNodeInnerFirst(ctx, node.members[i]!, fn)) as (typeof node.members)[number];
			}
			break;
		}
	}


	return node;
}


export function visitNodesOuterFirst<T>(ctx: { val: T }, nodes: Node.Node[], fn: (c: T, node: Node.Node) => Node.Node): Node.Node[] {
	return nodes.map(node => visitNodeOuterFirst(ctx, node, fn));
}

export function visitNodeOuterFirst<T>(ctx: { val: T }, node: Node.Node, fn: (c: T, node: Node.Node) => Node.Node): Node.Node {
	const result = fn(ctx.val, node);

	// nested nodes
	switch (result.type) {
		case 'def': {
			result.expr = visitNodeOuterFirst(ctx, result.expr, fn) as Node.Definition['expr'];
			break;
		}
		case 'return': {
			result.expr = visitNodeOuterFirst(ctx, result.expr, fn) as Node.Return['expr'];
			break;
		}
		case 'each': {
			result.items = visitNodeOuterFirst(ctx, result.items, fn) as Node.Each['items'];
			result.for = visitNodeOuterFirst(ctx, result.for, fn) as Node.Each['for'];
			break;
		}
		case 'for': {
			if (result.from != null) {
				result.from = visitNodeOuterFirst(ctx, result.from, fn) as Node.For['from'];
			}
			if (result.to != null) {
				result.to = visitNodeOuterFirst(ctx, result.to, fn) as Node.For['to'];
			}
			if (result.times != null) {
				result.times = visitNodeOuterFirst(ctx, result.times, fn) as Node.For['times'];
			}
			result.for = visitNodeOuterFirst(ctx, result.for, fn) as Node.For['for'];
			break;
		}
		case 'loop': {
			for (let i = 0; i < result.statements.length; i++) {
				result.statements[i] = visitNodeOuterFirst(ctx, result.statements[i]!, fn) as Node.Loop['statements'][number];
			}
			break;
		}
		case 'addAssign':
		case 'subAssign':
		case 'assign': {
			result.expr = visitNodeOuterFirst(ctx, result.expr, fn) as Node.Assign['expr'];
			result.dest = visitNodeOuterFirst(ctx, result.dest, fn) as Node.Assign['dest'];
			break;
		}
		case 'not': {
			result.expr = visitNodeOuterFirst(ctx, result.expr, fn) as Node.Return['expr'];
			break;
		}
		case 'if': {
			result.cond = visitNodeOuterFirst(ctx, result.cond, fn) as Node.If['cond'];
			result.then = visitNodeOuterFirst(ctx, result.then, fn) as Node.If['then'];
			for (const prop of result.elseif) {
				prop.cond = visitNodeOuterFirst(ctx, prop.cond, fn) as Node.If['elseif'][number]['cond'];
				prop.then = visitNodeOuterFirst(ctx, prop.then, fn) as Node.If['elseif'][number]['then'];
			}
			if (result.else != null) {
				result.else = visitNodeOuterFirst(ctx, result.else, fn) as Node.If['else'];
			}
			break;
		}
		case 'fn': {
			for (let i = 0; i < result.children.length; i++) {
				result.children[i] = visitNodeOuterFirst(ctx, result.children[i]!, fn) as Node.Fn['children'][number];
			}
			break;
		}
		case 'match': {
			result.about = visitNodeOuterFirst(ctx, result.about, fn) as Node.Match['about'];
			for (const prop of result.qs) {
				prop.q = visitNodeOuterFirst(ctx, prop.q, fn) as Node.Match['qs'][number]['q'];
				prop.a = visitNodeOuterFirst(ctx, prop.a, fn) as Node.Match['qs'][number]['a'];
			}
			if (result.default != null) {
				result.default = visitNodeOuterFirst(ctx, result.default, fn) as Node.Match['default'];
			}
			break;
		}
		case 'block': {
			for (let i = 0; i < result.statements.length; i++) {
				result.statements[i] = visitNodeOuterFirst(ctx, result.statements[i]!, fn) as Node.Block['statements'][number];
			}
			break;
		}
		case 'tmpl': {
			for (let i = 0; i < result.tmpl.length; i++) {
				const item = result.tmpl[i]!;
				if (typeof item !== 'string') {
					result.tmpl[i] = visitNodeOuterFirst(ctx, item, fn) as Node.Tmpl['tmpl'][number];
				}
			}
			break;
		}
		case 'obj': {
			break;
		}
		case 'arr': {
			for (let i = 0; i < result.value.length; i++) {
				result.value[i] = visitNodeOuterFirst(ctx, result.value[i]!, fn) as Node.Arr['value'][number];
			}
			break;
		}
		case 'call': {
			result.target = visitNodeOuterFirst(ctx, result.target, fn) as Node.Call['target'];
			for (let i = 0; i < result.args.length; i++) {
				result.args[i] = visitNodeOuterFirst(ctx, result.args[i]!, fn) as Node.Call['args'][number];
			}
			break;
		}
		case 'index': {
			result.target = visitNodeOuterFirst(ctx, result.target, fn) as Node.Index['target'];
			result.index = visitNodeOuterFirst(ctx, result.index, fn) as Node.Index['index'];
			break;
		}
		case 'prop': {
			result.target = visitNodeOuterFirst(ctx, result.target, fn) as Node.Prop['target'];
			break;
		}
		case 'ns': {
			for (let i = 0; i < result.members.length; i++) {
				result.members[i] = visitNodeOuterFirst(ctx, result.members[i]!, fn) as (typeof result.members)[number];
			}
			break;
		}
	}


	return result;
}

