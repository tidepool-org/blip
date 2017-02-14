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

import * as constants from '../../src/utils/constants';

describe('constants', () => {
  describe('BG_HIGH', () => {
    it('should be High', () => {
      expect(constants.BG_HIGH).to.equal('High');
    });
  });

  describe('BG_LOW', () => {
    it('should be Low', () => {
      expect(constants.BG_LOW).to.equal('Low');
    });
  });

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
