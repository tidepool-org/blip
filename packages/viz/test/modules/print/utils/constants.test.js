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

import * as constants from '../../../../src/modules/print/utils/constants';

describe('constants', () => {
  describe('DPI', () => {
    it('should be 72', () => {
      expect(constants.DPI).to.equal(72);
    });
  });

  describe('MARGIN', () => {
    it('should be 36', () => {
      expect(constants.MARGIN).to.equal(36);
    });
  });

  describe('HEIGHT', () => {
    it('should be sized to fit an 11 inch paper with margins applied', () => {
      const height = 11 * constants.DPI - (2 * constants.MARGIN);
      expect(constants.HEIGHT).to.equal(height);
    });
  });

  describe('WIDTH', () => {
    it('should be sized to fit an 11 inch paper with margins applied', () => {
      const width = 8.5 * constants.DPI - (2 * constants.MARGIN);
      expect(constants.WIDTH).to.equal(width);
    });
  });

  describe('MARGINS', () => {
    it('should be an object with correct left, right, top, and bottom values', () => {
      expect(constants.MARGINS).to.eql({
        left: constants.MARGIN,
        top: constants.MARGIN,
        right: constants.MARGIN,
        bottom: constants.MARGIN,
      });
    });
  });

  describe('DEFAULT_FONT_SIZE', () => {
    it('should be 10', () => {
      expect(constants.DEFAULT_FONT_SIZE).to.equal(10);
    });
  });

  describe('LARGE_FONT_SIZE', () => {
    it('should be 12', () => {
      expect(constants.LARGE_FONT_SIZE).to.equal(12);
    });
  });

  describe('FOOTER_FONT_SIZE', () => {
    it('should be 8', () => {
      expect(constants.FOOTER_FONT_SIZE).to.equal(8);
    });
  });

  describe('HEADER_FONT_SIZE', () => {
    it('should be 14', () => {
      expect(constants.HEADER_FONT_SIZE).to.equal(14);
    });
  });

  describe('SMALL_FONT_SIZE', () => {
    it('should be 8', () => {
      expect(constants.SMALL_FONT_SIZE).to.equal(8);
    });
  });

  describe('EXTRA_SMALL_FONT_SIZE', () => {
    it('should be 6', () => {
      expect(constants.EXTRA_SMALL_FONT_SIZE).to.equal(6);
    });
  });
});
