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

/* eslint-env node, mocha */

import * as format from '../../src/utils/format';

describe('format', () => {
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
  });
});
