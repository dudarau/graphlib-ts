/* global define */

define(function(require) {
  // These are smoke tests to make sure the bundles look like they are working
  // correctly.

  const chai from "chai");
  const graphlib from "graphlib");
  const graphlibCore from "graphlib.core");
  const expect = chai.expect;

  describe("core bundle", function() {
    it("exports graphlib", function() {
      expect(graphlibCore).to.be.an("object");
      expect(graphlibCore.Graph).to.be.a("function");
      expect(graphlibCore.json).to.be.a("object");
      expect(graphlibCore.alg).to.be.a("object");
      expect(graphlibCore.version).to.be.a("string");
    });

    it("can do simple graph operations", function() {
      const g = new graphlibCore.Graph();
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");
      expect(g.hasNode("a")).to.be.true;
      expect(g.hasNode("b")).to.be.true;
      expect(g.hasEdge("a", "b")).to.be.true;
    });

    it("can serialize to json and back", function() {
      const g = new graphlibCore.Graph();
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");

      const json = graphlibCore.json.write(g);
      const g2 = graphlibCore.json.read(json);
      expect(g2.hasNode("a")).to.be.true;
      expect(g2.hasNode("b")).to.be.true;
      expect(g2.hasEdge("a", "b")).to.be.true;
    });
  });

  describe("bundle", function() {
    it("exports graphlib", function() {
      expect(graphlib).to.be.an("object");
      expect(graphlib.Graph).to.be.a("function");
      expect(graphlib.json).to.be.a("object");
      expect(graphlib.alg).to.be.a("object");
      expect(graphlib.version).to.be.a("string");
    });

    it("can do simple graph operations", function() {
      const g = new graphlib.Graph();
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");
      expect(g.hasNode("a")).to.be.true;
      expect(g.hasNode("b")).to.be.true;
      expect(g.hasEdge("a", "b")).to.be.true;
    });

    it("can serialize to json and back", function() {
      const g = new graphlib.Graph();
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");

      const json = graphlib.json.write(g);
      const g2 = graphlib.json.read(json);
      expect(g2.hasNode("a")).to.be.true;
      expect(g2.hasNode("b")).to.be.true;
      expect(g2.hasEdge("a", "b")).to.be.true;
    });
  });
});
