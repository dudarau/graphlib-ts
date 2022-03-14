const expect from './chai').expect;

describe('version', function() {
  it('should match the version from package.json', function() {
    const packageVersion from '../package').version;
    expect(require('../lib/version')).to.equal(packageVersion);
  });
});
