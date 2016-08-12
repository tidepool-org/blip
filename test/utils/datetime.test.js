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

import * as datetime from '../../src/utils/datetime';

describe('datetime', () => {
  describe('millisecondsAsTimeOfDay', () => {
    it('should give format hh:mm a', () => {
      expect(datetime.millisecondsAsTimeOfDay(12600000)).to.equal('03:30 am');
    });
    it('should allow for pm', () => {
      expect(datetime.millisecondsAsTimeOfDay(72000000)).to.equal('08:00 pm');
    });
    it('should give nothing when no milliseconds given', () => {
      expect(datetime.millisecondsAsTimeOfDay()).to.equal('');
    });
  });
  describe('THREE_HRS', () => {
    it('should be an integer', () => {
      assert.isNumber(datetime.THREE_HRS);
    });
  });
  describe('TWENTY_FOUR_HRS', () => {
    it('should be an integer', () => {
      assert.isNumber(datetime.TWENTY_FOUR_HRS);
    });
  });
});
