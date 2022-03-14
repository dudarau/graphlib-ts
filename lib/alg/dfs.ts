import lodash from '../lodash';
import { Graph } from '../graph';

/*
 * A helper that preforms a pre- or post-order traversal on the input graph
 * and returns the nodes in the order they were visited. If the graph is
 * undirected then this algorithm will navigate using neighbors. If the graph
 * is directed then this algorithm will navigate using successors.
 *
 * Order must be one of "pre" or "post".
 */
export function dfs(g: Graph, vs: any, order: any) {
  if (!lodash.isArray(vs)) {
    vs = [vs];
  }

  const navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);

  let acc: any[] = [];
  const visited = {};
  lodash.each(vs, function (v) {
    if (!g.hasNode(v)) {
      throw new Error('Graph does not have node: ' + v);
    }

    doDfs(g, v, order === 'post', visited, navigation, acc);
  });
  return acc;
}

function doDfs(g: Graph, v: any, postorder: any, visited: any, navigation: any, acc: any) {
  if (!lodash.has(visited, v)) {
    visited[v] = true;

    if (!postorder) {
      acc.push(v);
    }
    lodash.each(navigation(v), function (w) {
      doDfs(g, w, postorder, visited, navigation, acc);
    });
    if (postorder) {
      acc.push(v);
    }
  }
}
