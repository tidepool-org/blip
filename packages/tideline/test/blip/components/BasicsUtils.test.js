/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

/* jshint esversion:6 */

/* global describe */
/* global context */
/* global it */
/* global expect */
/* global chai */

var expect = chai.expect;

const BasicsUtils = require('../../../plugins/blip/basics/components/BasicsUtils');

describe('BasicsUtils', () => {
  let util;

  const optionMatchingPathAndKey = {
    path: 'smbg',
    key: 'smbg',
  };

  const optionTotalKey = {
    path: 'smbg',
    key: 'total',
  };

  const optionOther = {
    key: 'data',
    path: 'other',
  };

  const optionOtherNoPath = {
    key: 'other',
  };

  const optionTotalNoPath = {
    key: 'total',
  };

  const data = {
    other: {
      data: {
        count: 6,
      },
    },
    smbg: {
      total: 8,
    },
    total: 14,
  };

  describe('getOptionValue', () => {
    context('no data provided', () => {
      it('should return 0', () => {
        expect(BasicsUtils.getOptionValue(optionMatchingPathAndKey)).to.equal(0);
      });
    });

    context('option key equals \'total\'', () => {
      it('should return the total value when path is provided', () => {
        expect(BasicsUtils.getOptionValue(optionTotalKey, data)).to.equal(8);
      });

      it('should return the total value when path is not provided', () => {
        expect(BasicsUtils.getOptionValue(optionTotalNoPath, data)).to.equal(14);
      });
    });

    context('option key does not equal \'total\'', () => {
      it('should return the correct value when the path and key match', () => {
        expect(BasicsUtils.getOptionValue(optionMatchingPathAndKey, data)).to.equal(8);
      });

      it('should return the correct value when path is provided', () => {
        expect(BasicsUtils.getOptionValue(optionOther, data)).to.equal(6);
      });

      it('should return 0 when no path is provided', () => {
        expect(BasicsUtils.getOptionValue(optionOtherNoPath, data)).to.equal(0);
      });
    });
  });
});
