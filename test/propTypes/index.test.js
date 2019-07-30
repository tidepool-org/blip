import * as propTypes from '../../src/propTypes';

describe('common propTypes', () => {
  it('should export `bgPrefsPropType` definition', () => {
    expect(propTypes.bgPrefsPropType).to.be.a('function');
  });
});
