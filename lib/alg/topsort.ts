import lodash from '../lodash';

export function topsort(g) {
  const visited = {};
  const stack = {};
  const results = [] as any[];

  function visit(node: any) {
    if (lodash.has(stack, node)) {
      throw new CycleException();
    }

    if (!lodash.has(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      lodash.each(g.predecessors(node), visit);
      delete stack[node];
      results.push(node);
    }
  }

  lodash.each(g.sinks(), visit);

  if (lodash.size(visited) !== g.nodeCount()) {
    throw new CycleException();
  }

  return results;
}

export function CycleException() {}
CycleException.prototype = new Error(); // must be an instance of Error to pass testing
