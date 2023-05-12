import * as Node from './node';

export function visitNodes<T>(ctx: { val: T }, nodes: Node.Node[], fn: (c: T, node: Node.Node) => Node.Node): Node.Node[] {
	// ctxを更新しながら再帰的にvisitNodeを呼び出す
	return nodes.map(node => visitNode(ctx, node, fn));
}
export function visitNode<T>(ctx: { val: T }, node: Node.Node, fn: (c: T, node: Node.Node) => Node.Node): Node.Node {
	const result = fn(ctx.val, node);

	// nested nodes
	switch (result.type) {
		case 'def': {
			result.expr = visitNode(ctx, result.expr, fn) as Node.Definition['expr'];
			break;
		}
		case 'return': {
			result.expr = visitNode(ctx, result.expr, fn) as Node.Return['expr'];
			break;
		}
		case 'each': {
			result.items = visitNode(ctx, result.items, fn) as Node.Each['items'];
			result.for = visitNode(ctx, result.for, fn) as Node.Each['for'];
			break;
		}
		case 'for': {
			if (result.from != null) {
				result.from = visitNode(ctx, result.from, fn) as Node.For['from'];
			}
			if (result.to != null) {
				result.to = visitNode(ctx, result.to, fn) as Node.For['to'];
			}
			if (result.times != null) {
				result.times = visitNode(ctx, result.times, fn) as Node.For['times'];
			}
			result.for = visitNode(ctx, result.for, fn) as Node.For['for'];
			break;
		}
		case 'loop': {
			for (let i = 0; i < result.statements.length; i++) {
				result.statements[i] = visitNode(ctx, result.statements[i]!, fn) as Node.Loop['statements'][number];
			}
			break;
		}
		case 'addAssign':
		case 'subAssign':
		case 'assign': {
			result.expr = visitNode(ctx, result.expr, fn) as Node.Assign['expr'];
			result.dest = visitNode(ctx, result.dest, fn) as Node.Assign['dest'];
			break;
		}
		case 'not': {
			result.expr = visitNode(ctx, result.expr, fn) as Node.Return['expr'];
			break;
		}
		case 'if': {
			result.cond = visitNode(ctx, result.cond, fn) as Node.If['cond'];
			result.then = visitNode(ctx, result.then, fn) as Node.If['then'];
			for (const prop of result.elseif) {
				prop.cond = visitNode(ctx, prop.cond, fn) as Node.If['elseif'][number]['cond'];
				prop.then = visitNode(ctx, prop.then, fn) as Node.If['elseif'][number]['then'];
			}
			if (result.else != null) {
				result.else = visitNode(ctx, result.else, fn) as Node.If['else'];
			}
			break;
		}
		case 'fn': {
			for (let i = 0; i < result.children.length; i++) {
				result.children[i] = visitNode(ctx, result.children[i]!, fn) as Node.Fn['children'][number];
			}
			break;
		}
		case 'match': {
			result.about = visitNode(ctx, result.about, fn) as Node.Match['about'];
			for (const prop of result.qs) {
				prop.q = visitNode(ctx, prop.q, fn) as Node.Match['qs'][number]['q'];
				prop.a = visitNode(ctx, prop.a, fn) as Node.Match['qs'][number]['a'];
			}
			if (result.default != null) {
				result.default = visitNode(ctx, result.default, fn) as Node.Match['default'];
			}
			break;
		}
		case 'block': {
			for (let i = 0; i < result.statements.length; i++) {
				result.statements[i] = visitNode(ctx, result.statements[i]!, fn) as Node.Block['statements'][number];
			}
			break;
		}
		case 'tmpl': {
			for (let i = 0; i < result.tmpl.length; i++) {
				const item = result.tmpl[i]!;
				if (typeof item !== 'string') {
					result.tmpl[i] = visitNode(ctx, item, fn) as Node.Tmpl['tmpl'][number];
				}
			}
			break;
		}
		case 'arr': {
			for (let i = 0; i < result.value.length; i++) {
				result.value[i] = visitNode(ctx, result.value[i]!, fn) as Node.Arr['value'][number];
			}
			break;
		}
		case 'call': {
			result.target = visitNode(ctx, result.target, fn) as Node.Call['target'];
			for (let i = 0; i < result.args.length; i++) {
				result.args[i] = visitNode(ctx, result.args[i]!, fn) as Node.Call['args'][number];
			}
			break;
		}
		case 'index': {
			result.target = visitNode(ctx, result.target, fn) as Node.Index['target'];
			result.index = visitNode(ctx, result.index, fn) as Node.Index['index'];
			break;
		}
		case 'prop': {
			result.target = visitNode(ctx, result.target, fn) as Node.Prop['target'];
			break;
		}
		case 'ns': {
			for (let i = 0; i < result.members.length; i++) {
				result.members[i] = visitNode(ctx, result.members[i]!, fn) as (typeof result.members)[number];
			}
			break;
		}
	}


	return result;
}
