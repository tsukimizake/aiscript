import * as Node from './node';

export function visitNodes<T>(ctx: { val: T }, nodes: Node.Node[], fn: (c: T, node: Node.Node) => Node.Node): Node.Node[] {
	// ctxを更新しながら再帰的にvisitNodeを呼び出す
	return nodes.map(node => fn(ctx.val, visitNode(ctx, node, fn)));
}
function visitNode<T>(ctx: { val: T }, node: Node.Node, fn: (c: T, node: Node.Node) => Node.Node): Node.Node {
	// nested nodes
	switch (node.type) {
		case 'def': {
			node.expr = fn(ctx.val, visitNode(ctx, node.expr, fn)) as Node.Definition['expr'];
			break;
		}
		case 'return': {
			node.expr = fn(ctx.val, visitNode(ctx, node.expr, fn)) as Node.Return['expr'];
			break;
		}
		case 'each': {
			node.items = fn(ctx.val, visitNode(ctx, node.items, fn)) as Node.Each['items'];
			node.for = fn(ctx.val, visitNode(ctx, node.for, fn)) as Node.Each['for'];
			break;
		}
		case 'for': {
			if (node.from != null) {
				node.from = fn(ctx.val, visitNode(ctx, node.from, fn)) as Node.For['from'];
			}
			if (node.to != null) {
				node.to = fn(ctx.val, visitNode(ctx, node.to, fn)) as Node.For['to'];
			}
			if (node.times != null) {
				node.times = fn(ctx.val, visitNode(ctx, node.times, fn)) as Node.For['times'];
			}
			node.for = fn(ctx.val, visitNode(ctx, node.for, fn)) as Node.For['for'];
			break;
		}
		case 'loop': {
			for (let i = 0; i < node.statements.length; i++) {
				node.statements[i] = fn(ctx.val, visitNode(ctx, node.statements[i]!, fn)) as Node.Loop['statements'][number];
			}
			break;
		}
		case 'addAssign':
		case 'subAssign':
		case 'assign': {
			node.expr = fn(ctx.val, visitNode(ctx, node.expr, fn)) as Node.Assign['expr'];
			node.dest = fn(ctx.val, visitNode(ctx, node.dest, fn)) as Node.Assign['dest'];
			break;
		}
		case 'not': {
			node.expr = fn(ctx.val, visitNode(ctx, node.expr, fn)) as Node.Return['expr'];
			break;
		}
		case 'if': {
			node.cond = fn(ctx.val, visitNode(ctx, node.cond, fn)) as Node.If['cond'];
			node.then = fn(ctx.val, visitNode(ctx, node.then, fn)) as Node.If['then'];
			for (const prop of node.elseif) {
				prop.cond = fn(ctx.val, visitNode(ctx, prop.cond, fn)) as Node.If['elseif'][number]['cond'];
				prop.then = fn(ctx.val, visitNode(ctx, prop.then, fn)) as Node.If['elseif'][number]['then'];
			}
			if (node.else != null) {
				node.else = fn(ctx.val, visitNode(ctx, node.else, fn)) as Node.If['else'];
			}
			break;
		}
		case 'fn': {
			for (let i = 0; i < node.children.length; i++) {
				node.children[i] = fn(ctx.val, visitNode(ctx, node.children[i]!, fn)) as Node.Fn['children'][number];
			}
			break;
		}
		case 'match': {
			node.about = fn(ctx.val, visitNode(ctx, node.about, fn)) as Node.Match['about'];
			for (const prop of node.qs) {
				prop.q = fn(ctx.val, visitNode(ctx, prop.q, fn)) as Node.Match['qs'][number]['q'];
				prop.a = fn(ctx.val, visitNode(ctx, prop.a, fn)) as Node.Match['qs'][number]['a'];
			}
			if (node.default != null) {
				node.default = fn(ctx.val, visitNode(ctx, node.default, fn)) as Node.Match['default'];
			}
			break;
		}
		case 'block': {
			for (let i = 0; i < node.statements.length; i++) {
				node.statements[i] = fn(ctx.val, visitNode(ctx, node.statements[i]!, fn)) as Node.Block['statements'][number];
			}
			break;
		}
		case 'tmpl': {
			for (let i = 0; i < node.tmpl.length; i++) {
				const item = node.tmpl[i]!;
				if (typeof item !== 'string') {
					node.tmpl[i] = fn(ctx.val, visitNode(ctx, item, fn)) as Node.Tmpl['tmpl'][number];
				}
			}
			break;
		}
		case 'arr': {
			for (let i = 0; i < node.value.length; i++) {
				node.value[i] = fn(ctx.val, visitNode(ctx, node.value[i]!, fn)) as Node.Arr['value'][number];
			}
			break;
		}
		case 'call': {
			node.target = fn(ctx.val, visitNode(ctx, node.target, fn)) as Node.Call['target'];
			for (let i = 0; i < node.args.length; i++) {
				node.args[i] = fn(ctx.val, visitNode(ctx, node.args[i]!, fn)) as Node.Call['args'][number];
			}
			break;
		}
		case 'index': {
			node.target = fn(ctx.val, visitNode(ctx, node.target, fn)) as Node.Index['target'];
			node.index = fn(ctx.val, visitNode(ctx, node.index, fn)) as Node.Index['index'];
			break;
		}
		case 'prop': {
			node.target = fn(ctx.val, visitNode(ctx, node.target, fn)) as Node.Prop['target'];
			break;
		}
		case 'ns': {
			for (let i = 0; i < node.members.length; i++) {
				node.members[i] = fn(ctx.val, visitNode(ctx, node.members[i]!, fn)) as (typeof node.members)[number];
			}
			break;
		}
	}


	return node;
}
