'use strict';

import lodash from './lodash';

const DEFAULT_EDGE_NAME = '\x00';
const GRAPH_NODE = '\x00';
const EDGE_KEY_DELIM = '\x01';


export interface Label {
  [key: string]: any;
}
export type WeightFn = (edge: Edge) => number;
export type EdgeFn = (outNodeName: string) => GraphEdge[];

export interface GraphLabel {
  width?: number | undefined;
  height?: number | undefined;
  compound?: boolean | undefined;
  rankdir?: string | undefined;
  align?: string | undefined;
  nodesep?: number | undefined;
  edgesep?: number | undefined;
  ranksep?: number | undefined;
  marginx?: number | undefined;
  marginy?: number | undefined;
  acyclicer?: string | undefined;
  ranker?: string | undefined;
}

export interface NodeConfig {
  width?: number | undefined;
  height?: number | undefined;
}

export interface EdgeConfig {
  minlen?: number | undefined;
  weight?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  lablepos?: 'l' | 'c' | 'r' | undefined;
  labeloffest?: number | undefined;
}

export interface Edge {
  v: string;
  w: string;
  name?: string | undefined;
}

export interface GraphEdge {
  points: Array<{ x: number; y: number }>;
  [key: string]: any;
}

export type Node<T = {}> = T & {
  x: number;
  y: number;
  width: number;
  height: number;
  class?: string | undefined;
  label?: string | undefined;
  padding?: number | undefined;
  paddingX?: number | undefined;
  paddingY?: number | undefined;
  rx?: number | undefined;
  ry?: number | undefined;
  shape?: string | undefined;
};

export class Graph<T = {}>{
  _opt: {
    directed?: boolean | undefined;
    multigraph?: boolean | undefined;
    compound?: boolean | undefined;
  } = {
  };
  _parent: any;
  _nodes = {} as any;
  _children: any;
  // v -> edgeObj
  _in = {};

  // u -> v -> Number
  _preds = {};

  // v -> edgeObj
  _out = {};

  // v -> w -> Number
  _sucs = {};

  // e -> edgeObj
  _edgeObjs = {};

  // e -> label
  _edgeLabels = {};

  // Label for the graph itself
  _label = undefined as GraphLabel | undefined;

  _edgeCount = 0;

  private get _isDirected() {
    return lodash.has(this._opt, 'directed') ? !!this._opt.directed : true;
  }

  private get _isMultigraph() {
    return lodash.has(this._opt, 'multigraph') ? !!this._opt.multigraph : false;
  }

  private get _isCompound() {
    return lodash.has(this._opt, 'compound') ? !!this._opt.compound : false;
  }

  isDirected() {
    return this._isDirected;
  }

  isMultigraph() {
    return this._isMultigraph;
  };

  isCompound() {
    return this._isCompound;
  };

  // Defaults to be set when creating a new node
  private get _defaultNodeLabelFn(){
    return lodash.constant(undefined);
  }

  // Defaults to be set when creating a new edge
  private _defaultEdgeLabelFn() {
    return lodash.constant(undefined);
  }

  constructor(opt?: {
    directed?: boolean | undefined;
    multigraph?: boolean | undefined;
    compound?: boolean | undefined;
  }): any {
    this._opt = opt || {};


    if (this._isCompound) {
      // v -> parent
      this._parent = {};

      // v -> children
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }
  }

  graph(): GraphLabel | undefined {
    return this._label;
  };

  setGraph(label: GraphLabel): Graph<T> {
    this._label = label;
    return this;
  };

  // edge(edgeObj: Edge): GraphEdge {
  //   // todo
  // };

  edge(outNodeName: string, inNodeName: string, name?: string): GraphEdge {
    const e =
        arguments.length === 1
            ? edgeObjToId(this._isDirected, arguments[0])
            : edgeArgsToId(this._isDirected, outNodeName, inNodeName, name);
    return this._edgeLabels[e];
  };

  edgeCount(): number {
    return this._edgeCount;
  };

  // edges(): Edge[] => {
  //
  // };
  //   hasEdge(edgeObj: Edge): boolean => {
  //
  // };
  hasEdge(outNodeName: string | Edge, inNodeName?: string, name?: string): boolean {
    const e =
        arguments.length === 1
            ? edgeObjToId(this._isDirected, arguments[0])
            : edgeArgsToId(this._isDirected, outNodeName, inNodeName, name);
    return lodash.has(this._edgeLabels, e);
  };
  inEdges(inNodeName: string, outNodeName?: string): Edge[] | undefined {
    const inV = this._in[inNodeName];
    if (inV) {
      const edges = lodash.values(inV);
      if (!outNodeName) {
        return edges;
      }
      return lodash.filter(edges, function (edge) {
        return edge.v === outNodeName;
      });
    }

    return undefined;

  };
  outEdges(outNodeName: string, inNodeName?: string): Edge[] | undefined {
    const outV = this._out[outNodeName];
    if (outV) {
      const edges = lodash.values(outV);
      if (!inNodeName) {
        return edges;
      }
      return lodash.filter(edges, function (edge) {
        return edge.w === inNodeName;
      });
    }

    return undefined;
  };
  removeEdge(outNodeName: string, inNodeName: string, name: string | undefined): Graph<T> {
    const e =
        arguments.length === 1
            ? edgeObjToId(this._isDirected, arguments[0])
            : edgeArgsToId(this._isDirected, outNodeName, inNodeName, name);
    const edge = this._edgeObjs[e];
    if (edge) {
      const v = edge.v;
      const w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      decrementOrRemoveEntry(this._preds[w], v);
      decrementOrRemoveEntry(this._sucs[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  };
  // setDefaultEdgeLabel(
  //     callback: string | ((v: string, w: string, name?: string) => string | Label),
  // ): Graph<T> => {
  //   if (!lodash.isFunction(callback)) {
  //     newDefault = lodash.constant(callback);
  //   }
  //   this._defaultEdgeLabelFn = newDefault;
  //   return this;
  // };
  setEdge(params: Edge, value?: string | { [key: string]: any }): Graph<T> {
    let v, w, name, value;
    let valueSpecified = false;
    let arg0 = arguments[0];

    if (typeof arg0 === 'object' && arg0 !== null && 'v' in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }

  v = '' + v;
  w = '' + w;
  if (!lodash.isUndefined(name)) {
    name = '' + name;
  }

  const e = edgeArgsToId(this._isDirected, v, w, name);
  if (lodash.has(this._edgeLabels, e)) {
    if (valueSpecified) {
      this._edgeLabels[e] = value;
    }
    return this;
  }

  if (!lodash.isUndefined(name) && !this._isMultigraph) {
    throw new Error('Cannot set a named edge when isMultigraph = false');
  }

  // It didn't exist, so we need to create it.
  // First ensure the nodes exist.
  this.setNode(v);
  this.setNode(w);

  this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);

  const edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
  // Ensure we add undirected edges in a consistent way.
  v = edgeObj.v;
  w = edgeObj.w;

  Object.freeze(edgeObj);
  this._edgeObjs[e] = edgeObj;
  incrementOrInitEntry(this._preds[w], v);
  incrementOrInitEntry(this._sucs[v], w);
  this._in[w][e] = edgeObj;
  this._out[v][e] = edgeObj;
  this._edgeCount++;
  return this;
  };
  // setEdge(sourceId: string, targetId: string, value?: string | Label, name?: string): Graph<T> => {
  //
  // };

  children(parentName: string): string[] | string | undefined {
    let v;
    if (lodash.isUndefined(parentName)) {
      v = GRAPH_NODE;
    }

    if (this._isCompound) {
      const children = this._children[v as any];
      if (children) {
        return lodash.keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this._nodes;
    } else if (this.hasNode(v as any)) {
      return [];
    }

    return;
  };

  hasNode(name: string): boolean {
    return lodash.has(this._nodes, name);
  };

  neighbors(name: string): Array<Node<T>> | undefined {
    const preds = this.predecessors(name);
    if (preds) {
      return lodash.union(preds, this.successors(name));
    }

    return undefined;
  };

  node(id: string | Label): Node<T> {
    return this._nodes[id];
  };

  nodeCount(): number {
    return this._nodeCount;
  };

  // nodes(): string[] {
  //
  // };

  parent(childName: string): string | undefined {
    if (this._isCompound) {
      const parent = this._parent[childName];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }

    return undefined;
  };

  predecessors(name: string): Array<Node<T>> | undefined {
    const predsV = this._preds[name];
    if (predsV) {
      return lodash.keys(predsV);
    }

    return undefined;
  };

  removeNode(name: string): Graph<T> {
    const self = this;
    if (lodash.has(this._nodes, name)) {
      const removeEdge = function (e: any) {
        self.removeEdge(self._edgeObjs[e]);
      };
      delete this._nodes[name];
      if (this._isCompound) {
      this._removeFromParentsChildList(name);
      delete this._parent[name];
      lodash.each(this.children(name), function (child) {
        self.setParent(child);
      });
      delete this._children[name];
    }
    lodash.each(lodash.keys(this._in[name]), removeEdge);
    delete this._in[name];
    delete this._preds[name];
    lodash.each(lodash.keys(this._out[name]), removeEdge);
    delete this._out[name];
    delete this._sucs[name];
    --this._nodeCount;
    }
    return this;
  };

  filterNodes(callback: (nodeId: string) => boolean): Graph<T> {
    const copy = new Graph({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound,
    });

    copy.setGraph(this.graph());

    const self = this;
    lodash.each(this._nodes, function (value, v) {
      if (callback(v)) {
        copy.setNode(v, value);
      }
    });

    lodash.each(this._edgeObjs, function (e) {
      if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
        copy.setEdge(e, self.edge(e));
      }
    });

    const parents = {};
    function findParent(v: any): any {
      const parent = self.parent(v);
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    }

    if (this._isCompound) {
      lodash.each(copy.nodes(), function (v) {
        copy.setParent(v, findParent(v));
      });
    }

    return copy;
  };

  setDefaultNodeLabel(callback: string | ((nodeId: string) => string | Label)): Graph<T> {
    let newDefault = callback;
    if (!lodash.isFunction(callback)) {
      newDefault = lodash.constant(callback);
    }
    this._defaultNodeLabelFn = newDefault;
    return this;
  };

  setNode(name: string, label?: string | Label): Graph<T> {
    if (lodash.has(this._nodes, name)) {
      if (arguments.length > 1) {
        this._nodes[name] = label;
      }
      return this;
    }

    this._nodes[name] = arguments.length > 1 ? label : this._defaultNodeLabelFn(name);
    if (this._isCompound) {
      this._parent[name] = GRAPH_NODE;
      this._children[name] = {};
      this._children[GRAPH_NODE][name] = true;
    }
    this._in[name] = {};
    this._preds[name] = {};
    this._out[name] = {};
    this._sucs[name] = {};
    ++this._nodeCount;
    return this;
  };

  setParent(childName: string, parentName: string): void {
    let parent = parentName;
    if (!this._isCompound) {
      throw new Error('Cannot set parent in a non-compound graph');
    }

    if (lodash.isUndefined(parent)) {
      parent = GRAPH_NODE;
    } else {
      // Coerce parent to string
      parent += '';
      for (let ancestor = parent; !lodash.isUndefined(ancestor); ancestor = this.parent(ancestor)) {
        if (ancestor === childName) {
          throw new Error('Setting ' + parent + ' as parent of ' + childName + ' would create a cycle');
        }
      }

      this.setNode(parent);
    }

    this.setNode(childName);
    this._removeFromParentsChildList(childName);
    this._parent[childName] = parent;
    this._children[parent][childName] = true;
    return this;
  };
  sinks(): Array<Node<T>> {

  };
  sources(): Array<Node<T>> => {

  };
  successors(name: string): Array<Node<T>> | undefined => {

  };
}

/* Number of nodes in the graph. Should only be changed by the implementation. */
Graph.prototype._nodeCount = 0;

/* Number of edges in the GraphTs. Should only be changed by the implementation. */
Graph.prototype._edgeCount = 0;

/* === Graph functions ========= */

Graph.prototype.isDirected = function () {
  return this._isDirected;
};

Graph.prototype.isMultigraph = function () {
  return this._isMultigraph;
};

Graph.prototype.isCompound = function () {
  return this._isCompound;
};

Graph.prototype.setGraph = function (label: string) {
  this._label = label;
  return this;
};

Graph.prototype.graph = function () {
  return this._label;
};

/* === Node functions ========== */

Graph.prototype.setDefaultNodeLabel = function (newDefault: any) {
  if (!lodash.isFunction(newDefault)) {
    newDefault = lodash.constant(newDefault);
  }
  this._defaultNodeLabelFn = newDefault;
  return this;
};

Graph.prototype.nodeCount = function () {
  return this._nodeCount;
};

Graph.prototype.nodes = function () {
  return lodash.keys(this._nodes);
};

Graph.prototype.sources = function () {
  const self = this;
  return lodash.filter(this.nodes(), function (v) {
    return lodash.isEmpty(self._in[v]);
  });
};

Graph.prototype.sinks = function () {
  const self = this;
  return lodash.filter(this.nodes(), function (v) {
    return lodash.isEmpty(self._out[v]);
  });
};

Graph.prototype.setNodes = function (vs: any, value: any) {
  const args = arguments;
  const self = this;
  lodash.each(vs, function (v) {
    if (args.length > 1) {
      self.setNode(v, value);
    } else {
      self.setNode(v);
    }
  });
  return this;
};

Graph.prototype.setNode = function (v: any, value: any) {
  if (lodash.has(this._nodes, v)) {
    if (arguments.length > 1) {
      this._nodes[v] = value;
    }
    return this;
  }

  this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
  if (this._isCompound) {
    this._parent[v] = GRAPH_NODE;
    this._children[v] = {};
    this._children[GRAPH_NODE][v] = true;
  }
  this._in[v] = {};
  this._preds[v] = {};
  this._out[v] = {};
  this._sucs[v] = {};
  ++this._nodeCount;
  return this;
};

Graph.prototype.node = function (v: any) {
  return this._nodes[v];
};

Graph.prototype.neighbors = function (v: any) {
  return lodash.has(this._nodes, v);
};

Graph.prototype.removeNode = function (v: any) {
  const self = this;
  if (lodash.has(this._nodes, v)) {
    const removeEdge = function (e: any) {
      self.removeEdge(self._edgeObjs[e]);
    };
    delete this._nodes[v];
    if (this._isCompound) {
      this._removeFromParentsChildList(v);
      delete this._parent[v];
      lodash.each(this.children(v), function (child) {
        self.setParent(child);
      });
      delete this._children[v];
    }
    lodash.each(lodash.keys(this._in[v]), removeEdge);
    delete this._in[v];
    delete this._preds[v];
    lodash.each(lodash.keys(this._out[v]), removeEdge);
    delete this._out[v];
    delete this._sucs[v];
    --this._nodeCount;
  }
  return this;
};

Graph.prototype.setParent = function (v: any, parent: any) {
  if (!this._isCompound) {
    throw new Error('Cannot set parent in a non-compound graph');
  }

  if (lodash.isUndefined(parent)) {
    parent = GRAPH_NODE;
  } else {
    // Coerce parent to string
    parent += '';
    for (let ancestor = parent; !lodash.isUndefined(ancestor); ancestor = this.parent(ancestor)) {
      if (ancestor === v) {
        throw new Error('Setting ' + parent + ' as parent of ' + v + ' would create a cycle');
      }
    }

    this.setNode(parent);
  }

  this.setNode(v);
  this._removeFromParentsChildList(v);
  this._parent[v] = parent;
  this._children[parent][v] = true;
  return this;
};

Graph.prototype._removeFromParentsChildList = function (v: any) {
  delete this._children[this._parent[v]][v];
};

Graph.prototype.parent = function (v: any) {
  if (this._isCompound) {
    const parent = this._parent[v];
    if (parent !== GRAPH_NODE) {
      return parent;
    }
  }
};

Graph.prototype.children = function (v: any) {
  if (lodash.isUndefined(v)) {
    v = GRAPH_NODE;
  }

  if (this._isCompound) {
    const children = this._children[v];
    if (children) {
      return lodash.keys(children);
    }
  } else if (v === GRAPH_NODE) {
    return this.nodes();
  } else if (this.hasNode(v)) {
    return [];
  }
};

Graph.prototype.predecessors = function (v: any) {
  const predsV = this._preds[v];
  if (predsV) {
    return lodash.keys(predsV);
  }

  return undefined;
};

Graph.prototype.successors = function (v: any) {
  const sucsV = this._sucs[v];
  if (sucsV) {
    return lodash.keys(sucsV);
  }

  return undefined;
};

Graph.prototype.neighbors = function (v: any) {
  const preds = this.predecessors(v);
  if (preds) {
    return lodash.union(preds, this.successors(v));
  }

  return undefined;
};

Graph.prototype.isLeaf = function (v: any) {
  let neighbors;
  if (this.isDirected()) {
    neighbors = this.successors(v);
  } else {
    neighbors = this.neighbors(v);
  }
  return neighbors.length === 0;
};

Graph.prototype.filterNodes = function (filter: any) {
  const copy = new this.constructor({
    directed: this._isDirected,
    multigraph: this._isMultigraph,
    compound: this._isCompound,
  });

  copy.setGraph(this.graph());

  const self = this;
  lodash.each(this._nodes, function (value, v) {
    if (filter(v)) {
      copy.setNode(v, value);
    }
  });

  lodash.each(this._edgeObjs, function (e) {
    if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
      copy.setEdge(e, self.edge(e));
    }
  });

  const parents = {};
  function findParent(v: any): any {
    const parent = self.parent(v);
    if (parent === undefined || copy.hasNode(parent)) {
      parents[v] = parent;
      return parent;
    } else if (parent in parents) {
      return parents[parent];
    } else {
      return findParent(parent);
    }
  }

  if (this._isCompound) {
    lodash.each(copy.nodes(), function (v) {
      copy.setParent(v, findParent(v));
    });
  }

  return copy;
};

/* === Edge functions ========== */

Graph.prototype.setDefaultEdgeLabel = function (newDefault: any) {
  if (!lodash.isFunction(newDefault)) {
    newDefault = lodash.constant(newDefault);
  }
  this._defaultEdgeLabelFn = newDefault;
  return this;
};

Graph.prototype.edgeCount = function () {
  return this._edgeCount;
};

Graph.prototype.edges = function () {
  return lodash.values(this._edgeObjs);
};

Graph.prototype.setPath = function (vs: any, value: any) {
  const self = this;
  const args = arguments;
  lodash.reduce(vs, function (v, w) {
    if (args.length > 1) {
      self.setEdge(v, w, value);
    } else {
      self.setEdge(v, w);
    }
    return w;
  });
  return this;
};

/*
 * setEdge(v, w, [value, [name]])
 * setEdge({ v, w, [name] }, [value])
 */
Graph.prototype.setEdge = function () {
  let v, w, name, value;
  let valueSpecified = false;
  let arg0 = arguments[0];

  if (typeof arg0 === 'object' && arg0 !== null && 'v' in arg0) {
    v = arg0.v;
    w = arg0.w;
    name = arg0.name;
    if (arguments.length === 2) {
      value = arguments[1];
      valueSpecified = true;
    }
  } else {
    v = arg0;
    w = arguments[1];
    name = arguments[3];
    if (arguments.length > 2) {
      value = arguments[2];
      valueSpecified = true;
    }
  }

  v = '' + v;
  w = '' + w;
  if (!lodash.isUndefined(name)) {
    name = '' + name;
  }

  const e = edgeArgsToId(this._isDirected, v, w, name);
  if (lodash.has(this._edgeLabels, e)) {
    if (valueSpecified) {
      this._edgeLabels[e] = value;
    }
    return this;
  }

  if (!lodash.isUndefined(name) && !this._isMultigraph) {
    throw new Error('Cannot set a named edge when isMultigraph = false');
  }

  // It didn't exist, so we need to create it.
  // First ensure the nodes exist.
  this.setNode(v);
  this.setNode(w);

  this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);

  const edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
  // Ensure we add undirected edges in a consistent way.
  v = edgeObj.v;
  w = edgeObj.w;

  Object.freeze(edgeObj);
  this._edgeObjs[e] = edgeObj;
  incrementOrInitEntry(this._preds[w], v);
  incrementOrInitEntry(this._sucs[v], w);
  this._in[w][e] = edgeObj;
  this._out[v][e] = edgeObj;
  this._edgeCount++;
  return this;
};

Graph.prototype.edge = function (v: any, w: any, name: string | undefined) {
  const e =
    arguments.length === 1
      ? edgeObjToId(this._isDirected, arguments[0])
      : edgeArgsToId(this._isDirected, v, w, name);
  return this._edgeLabels[e];
};

Graph.prototype.hasEdge = function (v: any, w: any, name: string | undefined) {
  const e =
    arguments.length === 1
      ? edgeObjToId(this._isDirected, arguments[0])
      : edgeArgsToId(this._isDirected, v, w, name);
  return lodash.has(this._edgeLabels, e);
};

Graph.prototype.removeEdge = function (v: any, w: any, name: string | undefined) {
  const e =
    arguments.length === 1
      ? edgeObjToId(this._isDirected, arguments[0])
      : edgeArgsToId(this._isDirected, v, w, name);
  const edge = this._edgeObjs[e];
  if (edge) {
    v = edge.v;
    w = edge.w;
    delete this._edgeLabels[e];
    delete this._edgeObjs[e];
    decrementOrRemoveEntry(this._preds[w], v);
    decrementOrRemoveEntry(this._sucs[v], w);
    delete this._in[w][e];
    delete this._out[v][e];
    this._edgeCount--;
  }
  return this;
};

Graph.prototype.inEdges = function (v: any, u: any) {
  const inV = this._in[v];
  if (inV) {
    const edges = lodash.values(inV);
    if (!u) {
      return edges;
    }
    return lodash.filter(edges, function (edge) {
      return edge.v === u;
    });
  }

  return undefined;
};

Graph.prototype.outEdges = function (v: any, w: any) {
  const outV = this._out[v];
  if (outV) {
    const edges = lodash.values(outV);
    if (!w) {
      return edges;
    }
    return lodash.filter(edges, function (edge) {
      return edge.w === w;
    });
  }

  return undefined;
};

Graph.prototype.nodeEdges = function (v: any, w: any) {
  const inEdges = this.inEdges(v, w);
  if (inEdges) {
    return inEdges.concat(this.outEdges(v, w));
  }
};

function incrementOrInitEntry(map: any, k: any) {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map: any, k: any) {
  if (!--map[k]) {
    delete map[k];
  }
}

function edgeArgsToId(isDirected: boolean, v_: any, w_: any, name: string | undefined) {
  let v = '' + v_;
  let w = '' + w_;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  return (
    v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (lodash.isUndefined(name) ? DEFAULT_EDGE_NAME : name)
  );
}

function edgeArgsToObj(isDirected: boolean, v_: any, w_: any, name: string | undefined) {
  let v = '' + v_;
  let w = '' + w_;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  const edgeObj = { v: v, w: w } as any;
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected: boolean, edgeObj: any) {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}
