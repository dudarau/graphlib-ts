import lodash from "lodash"
import { Graph } from "../graph";
import {postorder} from "./postorder";

describe("alg.postorder", function() {
  it("returns the root for a singleton graph", function() {
    const g = new Graph();
    g.setNode("a");
    expect(postorder(g, "a")).to.eql(["a"]);
  });

  it("visits each node in the graph once", function() {
    const g = new Graph();
    g.setPath(["a", "b", "d", "e"]);
    g.setPath(["a", "c", "d", "e"]);

    const nodes = postorder(g, "a");
    expect(lodash.sortBy(nodes)).to.eql(["a", "b", "c", "d", "e"]);
  });

  it("works for a tree", function() {
    const g = new Graph();
    g.setEdge("a", "b");
    g.setPath(["a", "c", "d"]);
    g.setEdge("c", "e");

    const nodes = postorder(g, "a");
    expect(lodash.sortBy(nodes)).to.eql(["a", "b", "c", "d", "e"]);
    expect(nodes.indexOf("b")).to.be.lt(nodes.indexOf("a"));
    expect(nodes.indexOf("c")).to.be.lt(nodes.indexOf("a"));
    expect(nodes.indexOf("d")).to.be.lt(nodes.indexOf("c"));
    expect(nodes.indexOf("e")).to.be.lt(nodes.indexOf("c"));
  });

  it("works for an array of roots", function() {
    const g = new Graph();
    g.setEdge("a", "b");
    g.setEdge("c", "d");
    g.setNode("e");
    g.setNode("f");

    const nodes = postorder(g, ["a", "b", "c", "e"]);
    expect(lodash.sortBy(nodes)).to.eql(["a", "b", "c", "d", "e"]);
    expect(nodes.indexOf("b")).to.be.lt(nodes.indexOf("a"));
    expect(nodes.indexOf("d")).to.be.lt(nodes.indexOf("c"));
  });

  it("works for multiple connected roots", function() {
    const g = new Graph();
    g.setEdge("a", "b");
    g.setEdge("a", "c");
    g.setEdge("d", "c");

    const nodes = postorder(g, ["a", "d"]);
    expect(lodash.sortBy(nodes)).to.eql(["a", "b", "c", "d"]);
    expect(nodes.indexOf("b")).to.be.lt(nodes.indexOf("a"));
    expect(nodes.indexOf("c")).to.be.lt(nodes.indexOf("a"));
    expect(nodes.indexOf("c")).to.be.lt(nodes.indexOf("d"));
  });

  it("fails if root is not in the graph", function() {
    const g = new Graph();
    g.setNode("a");
    expect(function() { postorder(g, "b"); }).to.throw();
  });
});
