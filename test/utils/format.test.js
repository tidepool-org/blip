/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

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
    it('should be a function', () => {
      assert.isFunction(format.displayBgValue);
    });

    it('should return a String integer by default (no recogizable `units` provided)', () => {
      expect(format.displayBgValue(120.5)).to.equal('121');
      expect(format.displayBgValue(120.5, 'foo')).to.equal('121');
    });

    it('should return a String integer if `units` are `mg/dL`', () => {
      expect(format.displayBgValue(120.5, 'mg/dL')).to.equal('121');
    });

    it('should return a String number w/one decimal point precision (`units` are `mmol/L`)', () => {
      expect(format.displayBgValue(6.6886513292098675, 'mmol/L')).to.equal('6.7');
    });
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
