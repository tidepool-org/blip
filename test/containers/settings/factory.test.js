/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as factory from '../../../src/containers/settings/factory';

import Medtronic from '../../../src/containers/settings/medtronic/Medtronic';
import Animas from '../../../src/containers/settings/animas/Animas';
import Omnipod from '../../../src/containers/settings/omnipod/Omnipod';
import Tandem from '../../../src/containers/settings/tandem/Tandem';

describe('factory', () => {
  describe('medtronic', () => {
    it('settings container returned when given carelink', () => {
      const chart = factory.getChart('carelink');
      expect(chart).to.equal(Medtronic);
    });
    it('settings container returned when given CareLinK', () => {
      const chart = factory.getChart('CareLinK');
      expect(chart).to.equal(Medtronic);
    });
  });
  describe('animas', () => {
    it('settings container returned when given animas', () => {
      const chart = factory.getChart('animas');
      expect(chart).to.equal(Animas);
    });
    it('settings container returned when given AnimaS', () => {
      const chart = factory.getChart('AnimaS');
      expect(chart).to.equal(Animas);
    });
  });
  describe('tandem', () => {
    it('settings container returned when given tandem', () => {
      const chart = factory.getChart('tandem');
      expect(chart).to.equal(Tandem);
    });
    it('settings container returned when given tAnDEM', () => {
      const chart = factory.getChart('tAnDEM');
      expect(chart).to.equal(Tandem);
    });
  });
  describe('omnipod', () => {
    it('settings container returned when given insulet', () => {
      const chart = factory.getChart('insulet');
      expect(chart).to.equal(Omnipod);
    });
    it('settings container returned when given iNSuLET', () => {
      const chart = factory.getChart('iNSuLET');
      expect(chart).to.equal(Omnipod);
    });
  });
});
