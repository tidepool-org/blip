/* global sinon */

export default class DataUtil {
  constructor() {
    this.bgSources = {
      cbg: true,
      smbg: true,
    };

    this.latestPump = {
      deviceModel: '1780',
      manufacturer: 'medtronic',
    };

    this.getAverageGlucoseData = sinon.stub().returns({
      averageGlucose: NaN,
      total: 0,
    });

    this.getAverageDailyCarbsData = sinon.stub().returns({
      averageDailyCarbs: NaN,
      total: 0,
    });

    this.getCoefficientOfVariationData = sinon.stub().returns({
      coefficientOfVariation: NaN,
      total: 0,
    });

    this.getGlucoseManagementIndicatorData = sinon.stub().returns({
      glucoseManagementIndicator: NaN,
      total: 0,
    });

    this.getReadingsInRangeData = sinon.stub().returns({
      veryLow: 0,
      low: 0,
      high: 0,
      veryHigh: 0,
      target: 0,
      total: 0,
    });

    this.getSensorUsage = sinon.stub().returns({
      sensorUsage: NaN,
      total: 0,
    });

    this.getStandardDevData = sinon.stub().returns({
      averageGlucose: NaN,
      standardDeviation: NaN,
      total: 0,
    });

    this.getTimeInAutoData = sinon.stub().returns({
      manual: NaN,
      automated: NaN,
    });

    this.getTimeInRangeData = sinon.stub().returns({
      veryLow: 0,
      low: 0,
      high: 0,
      veryHigh: 0,
      target: 0,
      total: 0,
    });

    this.getTotalInsulinData = sinon.stub().returns({
      basal: NaN,
      bolus: NaN,
    });
  }
}
