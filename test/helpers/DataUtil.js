/* global sinon */

export default class DataUtil {
  constructor(data = [], opts = {}) {
    this.bgSources = {
      cbg: true,
      smbg: true,
    };

    this.latestPump = {
      deviceModel: '1780',
      manufacturer: 'medtronic',
    };

    this.getAverageGlucoseData = sinon.stub().returns({
      averageGlucose: 0,
      total: 0,
    });

    this.getAverageDailyCarbsData = sinon.stub().returns({
      averageDailyCarbs: 0,
      total: 0,
    });

    this.getCoefficientOfVariationData = sinon.stub().returns({});

    this.getGlucoseManagementIndicatorData = sinon.stub().returns({});

    this.getReadingsInRangeData = sinon.stub().returns({
      veryLow: 0,
      low: 0,
      high: 0,
      veryHigh: 0,
      target: 0,
      total: 0,
    });

    this.getSensorUsage = sinon.stub().returns({});

    this.getStandardDevData = sinon.stub().returns({});

    this.getTimeInAutoData = sinon.stub().returns({
      manual: 0,
      automated: 0,
    });

    this.getTimeInRangeData = sinon.stub().returns({
      veryLow: 0,
      low: 0,
      high: 0,
      veryHigh: 0,
      target: 0,
      total: 0,
    });

    this.getTotalInsulinData = sinon.stub().returns({});
  }
}

