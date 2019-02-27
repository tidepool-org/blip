/* global sinon */

export default class DataUtil {
  constructor(data = [], opts = {}) {
    this.bgSources = opts.bgSources || {
      cbg: true,
      smbg: true,
    };

    this._endpoints = opts.endpoints || [];
    this._chartPrefs = opts.chartPrefs || {};

    this.defaultBgSource = 'cbg';
    this.bgBounds = {};
    this.bgUnits = 'mg/dL';
    this.days = {};

    this.latestPump = opts.latestPump || {
      deviceModel: 'Ping',
      manufacturer: 'Animas',
    };

    this.addData = sinon.stub();

    this.getAverageGlucoseData = sinon.stub().returns({
      averageGlucose: NaN,
      total: 0,
    });

    this.getCarbsData = sinon.stub().returns({
      carbs: NaN,
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

    this.getBasalBolusData = sinon.stub().returns({
      basal: NaN,
      bolus: NaN,
    });

    this.getTotalInsulinData = sinon.stub().returns({
      totalInsulin: NaN,
    });
  }

  get bgSource() {
    return this.defaultBgSource;
  }

  set chartPrefs(chartPrefs = {}) {
    this._chartPrefs = chartPrefs;
  }

  set endpoints(endpoints = []) {
    this._endpoints = endpoints;
  }
}
