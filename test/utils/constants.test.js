/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as constants from '../../src/utils/constants';

describe('constants', () => {
  describe('MMOLL_UNITS', () => {
    it('should be mmol/L', () => {
      expect(constants.MMOLL_UNITS).to.equal('mmol/L');
    });
  });
  describe('MGDL_UNITS', () => {
    it('should be mg/dL', () => {
      expect(constants.MGDL_UNITS).to.equal('mg/dL');
    });
  });
});
