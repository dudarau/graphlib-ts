import { Graph } from "../graph";
import lodash from "../lodash";
import {tarjan} from "./tarjan";

export function findCycles(g: Graph) {
  return lodash.filter(tarjan(g), function(cmpt) {
    return cmpt.length > 1 || (cmpt.length === 1 && g.hasEdge(cmpt[0], cmpt[0]));
  });
}
