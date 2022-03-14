import lodash from "../lodash"
import {Graph} from "../graph";

const DEFAULT_WEIGHT_FUNC = lodash.constant(1);

export function floydWarshall(g: Graph, weightFn: any, edgeFn: any) {
  return runFloydWarshall(g,
    weightFn || DEFAULT_WEIGHT_FUNC,
    edgeFn || function(v: any) { return g.outEdges(v); });
}

function runFloydWarshall(g: Graph, weightFn: any, edgeFn: any) {
  const results = {};
  const nodes = g.nodes();

  nodes.forEach(function(v: any) {
    results[v] = {};
    results[v][v] = { distance: 0 };
    nodes.forEach(function(w: any) {
      if (v !== w) {
        results[v][w] = { distance: Number.POSITIVE_INFINITY };
      }
    });
    edgeFn(v).forEach(function(edge: any) {
      const w = edge.v === v ? edge.w : edge.v;
      const d = weightFn(edge);
      results[v][w] = { distance: d, predecessor: v };
    });
  });

  nodes.forEach(function(k: any) {
    const rowK = results[k];
    nodes.forEach(function(i: any) {
      const rowI = results[i];
      nodes.forEach(function(j: any) {
        const ik = rowI[k];
        const kj = rowK[j];
        const ij = rowI[j];
        const altDistance = ik.distance + kj.distance;
        if (altDistance < ij.distance) {
          ij.distance = altDistance;
          ij.predecessor = kj.predecessor;
        }
      });
    });
  });

  return results;
}
