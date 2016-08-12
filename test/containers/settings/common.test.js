/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as common from '../../../src/containers/settings/common';

describe('common', () => {
  describe('DISPLAY_PRESCION_PLACES', () => {
    it('should be 3', () => {
      expect(common.DISPLAY_PRESCION_PLACES).to.equal(3);
    });
  });
  describe('MMOLL_UNITS', () => {
    it('should be mmol/L', () => {
      expect(common.MMOLL_UNITS).to.equal('mmol/L');
    });
  });
  describe('MGDL_UNITS', () => {
    it('should be mg/dL', () => {
      expect(common.MGDL_UNITS).to.equal('mg/dL');
    });
  });
});
