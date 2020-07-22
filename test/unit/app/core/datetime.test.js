import * as datetimeUtils from '../../../../app/core/datetime';

import { MS_IN_MIN, MS_IN_HOUR } from '../../../../app/core/constants';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('datetime', function() {
  describe('convertMsPer24ToTimeString', () => {
    it('should convert an msPer24 timestamp to an hh:mm string', () => {
      expect(datetimeUtils.convertMsPer24ToTimeString(MS_IN_HOUR * 2 + MS_IN_MIN * 8)).to.equal('02:08');
      expect(datetimeUtils.convertMsPer24ToTimeString(MS_IN_HOUR * 17 + MS_IN_MIN * 59)).to.equal('17:59');
    });
  });

  describe('convertTimeStringToMsPer24', () => {
    it('should convert an hh:mm time string to an msPer24 timestamp', () => {
      expect(datetimeUtils.convertTimeStringToMsPer24('02:08')).to.equal(MS_IN_HOUR * 2 + MS_IN_MIN * 8);
      expect(datetimeUtils.convertTimeStringToMsPer24('17:59')).to.equal(MS_IN_HOUR * 17 + MS_IN_MIN * 59);
    });
  });
});
