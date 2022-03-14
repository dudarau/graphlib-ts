import { dijkstra } from './dijkstra';
import lodash from '../lodash';
import { Graph } from '../graph';

export function dijkstraAll(g: Graph, weightFunc: any, edgeFunc: any) {
  return lodash.transform(
    g.nodes(),
    function (acc, v) {
      acc[v] = dijkstra(g, v, weightFunc, edgeFunc);
    },
    {},
  );
}
