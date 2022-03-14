import lodash from '../lodash';
import { Graph } from '../graph';
import alg from './index';

const components = alg.components;

describe('alg.components', function () {
  it('returns an empty list for an empty graph', function () {
    expect(components(new Graph({ directed: false }))).to.be.empty;
  });

  it('returns singleton lists for unconnected nodes', function () {
    const g = new Graph({ directed: false });
    g.setNode('a');
    g.setNode('b');

    const result = lodash.sortBy(components(g), function (arr) {
      return lodash.min(arr);
    });
    expect(result).to.eql([['a'], ['b']]);
  });

  it('returns a list of nodes in a component', function () {
    const g = new Graph({ directed: false });
    g.setEdge('a', 'b');
    g.setEdge('b', 'c');

    const result = lodash.map(components(g), function (xs) {
      return lodash.sortBy(xs);
    });
    expect(result).to.eql([['a', 'b', 'c']]);
  });

  it('returns nodes connected by a neighbor relationship in a digraph', function () {
    const g = new Graph();
    g.setPath(['a', 'b', 'c', 'a']);
    g.setEdge('d', 'c');
    g.setEdge('e', 'f');

    const result = lodash.sortBy(
      lodash.map(components(g), function (xs) {
        return lodash.sortBy(xs);
      }),
      '0',
    );
    expect(result).to.eql([
      ['a', 'b', 'c', 'd'],
      ['e', 'f'],
    ]);
  });
});
