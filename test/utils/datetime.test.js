/* eslint-env node, mocha */
/* eslint no-console: 0*/

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
});
