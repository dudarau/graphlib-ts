import lodash from "../lodash";
import {Graph} from "../graph";


export function tarjan(g: Graph) {
  let index = 0;
  const stack = [] as any[];
  const visited = {}; // node id -> { onStack, lowlink, index }
  const results = [] as any[];

  function dfs(v: any) {
    const entry = visited[v] = {
      onStack: true,
      lowlink: index,
      index: index++
    };
    stack.push(v);

    g.successors(v).forEach(function(w) {
      if (!lodash.has(visited, w)) {
        dfs(w);
        entry.lowlink = Math.min(entry.lowlink, visited[w].lowlink);
      } else if (visited[w].onStack) {
        entry.lowlink = Math.min(entry.lowlink, visited[w].index);
      }
    });

    if (entry.lowlink === entry.index) {
      const cmpt = [];
      let w;
      do {
        w = stack.pop();
        visited[w].onStack = false;
        cmpt.push(w);
      } while (v !== w);
      results.push(cmpt);
    }
  }

  g.nodes().forEach(function(v: any) {
    if (!lodash.has(visited, v)) {
      dfs(v);
    }
  });

  return results;
}
