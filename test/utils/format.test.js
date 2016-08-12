/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as format from '../../src/utils/format';

describe('format', () => {
  describe('displayDecimal', () => {
    it('should give no places when none specified', () => {
      expect(format.displayDecimal(9.3328)).to.equal('9');
    });
    it('should give no places when zero specified', () => {
      expect(format.displayDecimal(9.3328, 0)).to.equal('9');
    });
    it('should give then number of places when specified', () => {
      expect(format.displayDecimal(9.3328, 1)).to.equal('9.3');
    });
  });
});
