import lodash from "../lodash";
import {Graph} from "../graph";

export function components(g: Graph) {
  const visited = {};
  let cmpts = [] as any[];
  let cmpt: any;

  function dfs(v: any) {
    if (lodash.has(visited, v)) return;
    visited[v] = true;
    cmpt.push(v);
    lodash.each((g as any).successors(v), dfs);
    lodash.each(g.predecessors(v), dfs);
  }

  lodash.each((g as any).nodes(), function(v) {
    cmpt = [];
    dfs(v);
    if (cmpt.length) {
      cmpts.push(cmpt);
    }
  });

  return cmpts;
}
