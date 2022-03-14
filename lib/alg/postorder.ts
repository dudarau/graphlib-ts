import {Graph} from "../graph";

import { dfs } from "./dfs";

export function postorder(g: Graph, vs: any) {
  return dfs(g, vs, "post");
}
