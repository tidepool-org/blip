/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as datetime from '../../src/utils/datetime';

describe('datetime', () => {
  describe('millisecondsAsTimeOfDay', () => {
    it('should give 03:30 am', () => {
      expect(datetime.millisecondsAsTimeOfDay(12600000)).to.equal('03:30 am');
    });
    it('should give 08:00 pm', () => {
      expect(datetime.millisecondsAsTimeOfDay(72000000)).to.equal('08:00 pm');
    });
  });
});
