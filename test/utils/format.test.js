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
    it('should give the number of places when they are specified', () => {
      expect(format.displayDecimal(9.3328, 1)).to.equal('9.3');
    });
  });
  describe('displayBgValue', () => {
    it('should give no decimals when mg/dl units', () => {
      expect(format.displayBgValue(352, 'mg/dL')).to.equal('352');
    });
    it('should round when mg/dl units', () => {
      expect(format.displayBgValue(352.77, 'mg/dL')).to.equal('353');
    });
    it('should give one decimal place when mmol/L', () => {
      expect(format.displayBgValue(12.52, 'mmol/L')).to.equal('12.5');
    });

    it('should round when mmol/L', () => {
      expect(format.displayBgValue(12.77, 'mmol/L')).to.equal('12.8');
    });
  });
});
