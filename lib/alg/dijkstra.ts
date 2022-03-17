import lodash from '../lodash';
import { PriorityQueue } from '../data/priority-queue';
import {Graph} from "../graph";

const DEFAULT_WEIGHT_FUNC = lodash.constant(1);

export function dijkstra(g: Graph, source: any, weightFn?: any, edgeFn?:any) {
  return runDijkstra(
    g,
    String(source),
    weightFn || DEFAULT_WEIGHT_FUNC,
    edgeFn ||
      function (v: any) {
        return g.outEdges(v);
      },
  );
}

function runDijkstra(g: Graph, source?: any, weightFn?: any, edgeFn?: any) {
  const results = {};
  const pq = new PriorityQueue();
  let v: any, vEntry: any;

  const updateNeighbors = function (edge) {
    const w = edge.v !== v ? edge.v : edge.w;
    const wEntry = results[w];
    const weight = weightFn(edge);
    const distance = vEntry.distance + weight;

    if (weight < 0) {
      throw new Error(
        'dijkstra does not allow negative edge weights. ' +
          'Bad edge: ' +
          edge +
          ' Weight: ' +
          weight,
      );
    }

    if (distance < wEntry.distance) {
      wEntry.distance = distance;
      wEntry.predecessor = v;
      pq.decrease(w, distance);
    }
  };

  g.nodes().forEach(function (v) {
    const distance = v === source ? 0 : Number.POSITIVE_INFINITY;
    results[v] = { distance: distance };
    pq.add(v, distance);
  });

  while (pq.size() > 0) {
    v = pq.removeMin();
    vEntry = results[v];
    if (vEntry.distance === Number.POSITIVE_INFINITY) {
      break;
    }

    edgeFn(v).forEach(updateNeighbors);
  }

  return results;
}
