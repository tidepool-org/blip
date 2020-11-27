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

import * as nonTandemData from '../../../src/utils/settings/nonTandemData';

const medtronicAutomatedData = require('../../../data/pumpSettings/medtronic/automated.json');

describe('[settings] non-Tandem data utils', () => {
  describe('basal', () => {
    it('should generate and return a basal schedule object', () => {
      expect(nonTandemData.basal(0, medtronicAutomatedData, 'medtronic')).to.be.an('object');
    });

    it('should set the `scheduleName` property', () => {
      const automated = nonTandemData.basal(0, medtronicAutomatedData, 'medtronic');
      const nonAutomated = nonTandemData.basal(1, medtronicAutomatedData, 'medtronic');

      expect(automated.scheduleName).to.equal('Auto Mode');
      expect(nonAutomated.scheduleName).to.equal('Standard');
    });

    it('should set the `activeAtUpload` property', () => {
      const active = nonTandemData.basal(0, medtronicAutomatedData, 'medtronic');
      const nonActive = nonTandemData.basal(1, medtronicAutomatedData, 'medtronic');

      expect(active.activeAtUpload).to.be.true;
      expect(nonActive.activeAtUpload).to.be.false;
    });

    it('should set the `isAutomated` property', () => {
      const automated = nonTandemData.basal(0, medtronicAutomatedData, 'medtronic');
      const nonAutomated = nonTandemData.basal(1, medtronicAutomatedData, 'medtronic');

      expect(automated.isAutomated).to.be.true;
      expect(nonAutomated.isAutomated).to.be.false;
    });

    it('should set the `columns` and `rows` to empty arrays for automated schedules', () => {
      const automated = nonTandemData.basal(0, medtronicAutomatedData, 'medtronic');
      const nonAutomated = nonTandemData.basal(1, medtronicAutomatedData, 'medtronic');

      expect(automated.rows).to.be.an('array').that.is.empty;
      expect(automated.columns).to.be.an('array').that.is.empty;

      expect(nonAutomated.rows).to.be.an('array').that.is.not.empty;
      expect(nonAutomated.columns).to.be.an('array').that.is.not.empty;
    });

    it('should set the `title` without units for automated schedules', () => {
      const automated = nonTandemData.basal(0, medtronicAutomatedData, 'medtronic');
      const nonAutomated = nonTandemData.basal(1, medtronicAutomatedData, 'medtronic');

      expect(automated.title).to.eql({
        main: 'Auto Mode',
        secondary: 'Active at upload',
        units: '',
      });

      expect(nonAutomated.title).to.eql({
        main: 'Standard',
        secondary: '',
        units: 'U/hr',
      });
    });
  });
});
