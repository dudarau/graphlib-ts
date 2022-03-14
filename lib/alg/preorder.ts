import { dfs } from './dfs';
import { Graph } from '../graph';

export function preorder(g: Graph, vs: any) {
  return dfs(g, vs, 'pre');
}
