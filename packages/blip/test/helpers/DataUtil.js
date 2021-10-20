import * as sinon from "sinon";

export default class DataUtil {
  // eslint-disable-next-line no-unused-vars
  constructor(data = [], opts = {}) {
    this.bgSources = opts.bgSources || {
      cbg: true,
      smbg: true,
    };

    this._endpoints = opts.endpoints || [];
    this._chartPrefs = opts.chartPrefs || {};

    this.defaultBgSource = "cbg";
    this.bgBounds = {};
    this.bgUnits = "mg/dL";
    this.days = {};

    this.latestPump = opts.latestPump || {
      deviceModel: "Ping",
      manufacturer: "Animas",
    };

    this.addData = sinon.stub();

    this.getAverageGlucoseData = sinon.stub().returns({
      averageGlucose: Number.NaN,
      total: 0,
    });

    this.getCarbsData = sinon.stub().returns({
      carbs: Number.NaN,
      total: 0,
    });

    this.getCoefficientOfVariationData = sinon.stub().returns({
      coefficientOfVariation: Number.NaN,
      total: 0,
    });

    this.getGlucoseManagementIndicatorData = sinon.stub().returns({
      glucoseManagementIndicator: Number.NaN,
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
      sensorUsage: Number.NaN,
      total: 0,
    });

    this.getStandardDevData = sinon.stub().returns({
      averageGlucose: Number.NaN,
      standardDeviation: Number.NaN,
      total: 0,
    });

    this.getTimeInAutoData = sinon.stub().returns({
      manual: Number.NaN,
      automated: Number.NaN,
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
      basal: Number.NaN,
      bolus: Number.NaN,
    });

    this.getTotalInsulinAndWeightData = sinon.stub().returns({
      totalInsulin: Number.NaN,
      weight: Number.NaN
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
