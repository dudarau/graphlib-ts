import lodash from './lodash';
import { Graph } from './graph';

export function write(g: typeof Graph) {
  const json = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound(),
    },
    nodes: writeNodes(g),
    edges: writeEdges(g),
  } as any;
  if (!lodash.isUndefined(g.graph())) {
    json.value = lodash.clone(g.graph());
  }
  return json;
}

function writeNodes(g: Graph) {
  return lodash.map(g.nodes(), function (v) {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node = { v: v } as any;
    if (!lodash.isUndefined(nodeValue)) {
      node.value = nodeValue;
    }
    if (!lodash.isUndefined(parent)) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g: Graph) {
  return lodash.map(g.edges(), function (e) {
    const edgeValue = g.edge(e);
    const edge = { v: e.v, w: e.w } as any;
    if (!lodash.isUndefined(e.name)) {
      edge.name = e.name;
    }
    if (!lodash.isUndefined(edgeValue)) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

export function read(json: any) {
  const g = new Graph(json.options).setGraph(json.value);
  lodash.each(json.nodes, function (entry) {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  lodash.each(json.edges, function (entry) {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}
