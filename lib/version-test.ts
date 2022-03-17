import packageVersion from '../package.json';

describe('version', function() {
  it('should match the version from package.json', function() {
    expect(require('../lib/version')).toEqual(packageVersion);
  });
});
