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
 * not, you can obtain one from Tidepoorol Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';
import moment from 'moment-timezone';

import * as dataUtils from '../../../src/utils/print/data';

describe('print data utils', () => {
  const start = '2017-01-02T00:00:00.000Z';
  const end = '2017-01-03T00:00:00.000Z';

  const datums = {
    cbg1: {
      type: 'cbg',
      normalTime: '2017-01-02T10:30:00.0000Z',
    },
    cbg2: {
      type: 'cbg',
      normalTime: '2017-01-03T10:30:00.0000Z',
    },
    smbg: {
      type: 'smbg',
      normalTime: '2017-01-02T10:30:00.0000Z',
    },
    basal: {
      type: 'basal',
      normalTime: '2017-01-02T8:30:00.0000Z',
    },
    bolus1: {
      type: 'bolus',
      normalTime: start,
      normalEnd: '2017-01-02T23:45:00.0000Z',
    },
    bolus2: {
      type: 'bolus',
      normalTime: '2017-01-01T23:30:00.0000Z',
      normalEnd: '2017-01-02T0:45:00.0000Z',
    },
    bolus3: {
      type: 'bolus',
      normalTime: '2017-01-02T8:30:00.0000Z',
      normalEnd: '2017-01-03T0:30:00.0000Z',
    },
    bolus4: {
      type: 'bolus',
      normalTime: '2017-01-01T23:30:00.0000Z',
      normalEnd: '2017-01-03T0:45:00.0000Z',
    },
    upload1: {
      normalTime: '2017-01-02T8:30:00.0000Z',
      type: 'upload',
      deviceTags: ['insulin-pump'],
    },
    upload2: {
      normalTime: '2017-01-02T10:30:00.0000Z',
      type: 'upload',
      deviceTags: ['insulin-pump'],
    },
  };

  const mostRecent = '2017-01-02T09:19:05.000Z';
  const groupedData = {
    basal: [
      datums.basal,
    ],
    bolus: [
      datums.bolus1,
      datums.bolus2,
      datums.bolus3,
      datums.bolus4,
    ],
    cbg: [
      datums.cbg1,
      datums.cbg2,
    ],
    smbg: [
      datums.smbg,
    ],
    upload: [
      datums.upload1,
      datums.upload2,
    ],
  };
  const numDays = 6;
  const timePrefs = {
    timezoneAware: false,
    timezoneName: null,
  };

  describe('selectDailyViewData', () => {
    let filtered;
    let latestFilteredData;
    let latestFilteredDate;

    const latestDataDate = mostRecent.split('T')[0];

    beforeEach(() => {
      filtered = dataUtils.selectDailyViewData(mostRecent, groupedData, numDays, timePrefs);
      latestFilteredDate = _.last(_.keys(filtered.dataByDate));
      latestFilteredData = filtered.dataByDate[latestFilteredDate];
    });

    it('should export a selectDailyViewData function', () => {
      expect(dataUtils.selectDailyViewData).to.be.a('function');
    });

    it('should return the most recent data available', () => {
      const outOfRangeDate = moment(latestDataDate).subtract(numDays, 'd').format('Y-M-D');

      expect(latestFilteredDate <= latestDataDate).to.be.true;
      expect(filtered.dataByDate[outOfRangeDate]).to.be.undefined;
    });

    it('should return data for the number of days specified', () => {
      expect(_.keys(filtered.dataByDate).length).to.equal(6);

      filtered = dataUtils.selectDailyViewData(mostRecent, groupedData, 3, timePrefs);
      expect(_.keys(filtered.dataByDate).length).to.equal(3);
    });

    it('should return basal data by date', () => {
      expect(latestFilteredData.data.basal).to.be.an('array');
      expect(latestFilteredData.data.basal.length > 0).to.be.true;
    });

    it('should return basal sequence data by date', () => {
      expect(latestFilteredData.data.basalSequences).to.be.an('array');
      expect(latestFilteredData.data.basalSequences.length > 0).to.be.true;
    });

    it('should return time in automode data by date', () => {
      expect(latestFilteredData.data.timeInAutoRatio).to.be.an('object');
      expect(latestFilteredData.data.timeInAutoRatio).to.have.all.keys(['automated', 'manual']);
    });

    it('should return bolus data by date', () => {
      expect(latestFilteredData.data.bolus).to.be.an('array');
      expect(latestFilteredData.data.bolus.length > 0).to.be.true;
    });

    it('should return cbg data by date', () => {
      expect(latestFilteredData.data.cbg).to.be.an('array');
      expect(latestFilteredData.data.cbg.length > 0).to.be.true;
    });

    it('should return smbg data by date', () => {
      expect(latestFilteredData.data.smbg).to.be.an('array');
      expect(latestFilteredData.data.smbg.length > 0).to.be.true;
    });

    it('should return the bg range', () => {
      expect(filtered.bgRange).to.be.an('array');
      expect(filtered.bgRange.length).to.equal(2);
    });

    it('should return the bolus range', () => {
      expect(filtered.bolusRange).to.be.an('array');
      expect(filtered.bolusRange.length).to.equal(2);
    });

    it('should return the basal range', () => {
      expect(filtered.basalRange).to.be.an('array');
      expect(filtered.basalRange.length).to.equal(2);
    });

    it('should return the latest pump upload', () => {
      expect(filtered.latestPumpUpload).to.be.an('object');
      expect(filtered.latestPumpUpload).to.equal(datums.upload2);
    });
  });

  describe('stripDatum', () => {
    it('should export a stripDatum function', () => {
      expect(dataUtils.stripDatum).to.be.a('function');
    });

    it('should strip all unneeded fields from Tidepool datum', () => {
      const originalDatum = {
        annotations: '',
        clockDriftOffset: '',
        conversionOffset: '',
        createdUserId: '',
        deviceId: '',
        deviceSerialNumber: '',
        deviceTime: '',
        displayOffset: '',
        guid: '',
        localDayOfWeek: '',
        localDate: '',
        modifiedUserId: '',
        normalEnd: '',
        normalTime: '',
        payload: '',
        scheduleName: '',
        source: '',
        time: '',
        timezoneOffset: '',
        type: 'cbg',
        units: '',
        uploadId: '',
        value: 75,
      };

      const stripped = dataUtils.stripDatum(originalDatum);
      expect(stripped).to.eql({
        annotations: '',
        normalEnd: '',
        normalTime: '',
        type: 'cbg',
        value: 75,
      });
    });
  });

  describe('filterWithDurationFnMaker', () => {
    it('should export a filterWithDurationFnMaker function', () => {
      expect(dataUtils.filterWithDurationFnMaker).to.be.a('function');
    });

    describe('returned filter function', () => {
      const filter = dataUtils.filterWithDurationFnMaker(start, end);

      it('should exist', () => {
        expect(filter).to.be.a('function');
      });

      it('returns whether or not a point-in-time datum falls within a range', () => {
        expect(filter(datums.cbg1)).to.be.true;
        expect(filter(datums.cbg2)).to.be.false;
      });

      it('returns whether or not a datum with duration falls within a range', () => {
        expect(filter(datums.bolus1)).to.be.true;
        expect(filter(datums.bolus2)).to.be.true;
        expect(filter(datums.bolus3)).to.be.true;
        expect(filter(datums.bolus4)).to.be.false;
      });
    });
  });

  describe('filterPointInTimeFnMaker', () => {
    it('should export a filterPointInTimeFnMaker function', () => {
      expect(dataUtils.filterPointInTimeFnMaker).to.be.a('function');
    });

    describe('returned filter function', () => {
      const filter = dataUtils.filterPointInTimeFnMaker(start, end);

      it('should exist', () => {
        expect(filter).to.be.a('function');
      });

      it('returns whether or not a point-in-time datum falls within a range', () => {
        expect(filter(datums.cbg1)).to.be.true;
        expect(filter(datums.cbg2)).to.be.false;
      });
    });
  });
});
