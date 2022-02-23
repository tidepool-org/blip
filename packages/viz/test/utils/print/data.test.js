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

import _ from "lodash";
import moment from "moment-timezone";
import { expect } from "chai";

import { TidelineData } from "tideline";

import { types } from "../../../data/types";
import DataUtil from "../../../../blip/test/helpers/DataUtil.js";
import { selectDailyViewData, generatePDFStats, updateBasalDiscontinuous } from "../../../src/utils/print/data";

describe("print data utils", () => {

  describe("updateBasalDiscontinuous", () => {
    it("should do nothing if there is no data", () => {
      updateBasalDiscontinuous([], [0, 1]);
    });
    it("should not set the discontinuous on continuous basal", () => {
      const basal = [{
        epoch: 0,
        epochEnd: 500,
        duration: 500,
      }, {
        epoch: 500,
        epochEnd: 1000,
        duration: 500,
      }];
      updateBasalDiscontinuous(basal, [0, 1000]);
      expect(basal[0].discontinuousStart).to.be.false;
      expect(basal[0].discontinuousEnd).to.be.false;
      expect(basal[1].discontinuousStart).to.be.false;
      expect(basal[1].discontinuousEnd).to.be.false;
    });
    it("should set the discontinuous on discontinuous basal", () => {
      const basal = [{
        epoch: 0,
        epochEnd: 400,
        duration: 400,
      }, {
        epoch: 500,
        epochEnd: 1000,
        duration: 500,
      }];
      updateBasalDiscontinuous(basal, [0, 1000]);
      expect(basal[0].discontinuousStart).to.be.false;
      expect(basal[0].discontinuousEnd).to.be.true;
      expect(basal[1].discontinuousStart).to.be.true;
      expect(basal[1].discontinuousEnd).to.be.false;
    });
    it("should clamp basal dates to the bounds values", () => {
      const basal = [{
        utc: 500,
        epoch: 500,
        epochEnd: 1500,
        duration: 1000,
      }, {
        epoch: 1500,
        epochEnd: 2500,
        duration: 1000,
      }];
      updateBasalDiscontinuous(basal, [1000, 2000]);
      expect(basal[0].discontinuousStart).to.be.false;
      expect(basal[0].discontinuousEnd).to.be.false;
      expect(basal[0].utc, "basal[0].utc").to.be.eq(1000);
      expect(basal[0].epoch, "basal[0].epoch").to.be.eq(1000);
      expect(basal[0].epochEnd, "basal[0].epochEnd").to.be.eq(1500);
      expect(basal[0].duration, "basal[0].duration").to.be.eq(500);
      expect(basal[0].normalTime, "basal[0].normalTime").to.be.eq("1970-01-01T00:00:01.000Z");
      expect(basal[1].discontinuousStart).to.be.false;
      expect(basal[1].discontinuousEnd).to.be.false;
      expect(basal[1].epoch, "basal[1].epoch").to.be.eq(1500);
      expect(basal[1].epochEnd, "basal[1].epochEnd").to.be.eq(2000);
      expect(basal[1].normalEnd, "basal[1].normalEnd").to.be.eq("1970-01-01T00:00:02.000Z");
      expect(basal[1].duration, "basal[1].duration").to.be.eq(500);

    });
  });

  describe("selectDailyViewData", () => {
    let filtered;
    let latestFilteredData;
    let latestFilteredDate;
    /** @type {TidelineData} */
    let tidelineData;

    beforeEach(async () => {
      const bolus = new types.Bolus({ deviceTime: "2019-05-26T11:00:01", timezone: "Europe/Paris" });
      bolus.wizard = new types.Wizard({ deviceTime: "2019-05-26T11:00:01", timezone: "Europe/Paris" });
      const data = [
        new types.Upload({ deviceTime: "2019-05-20T08:59:37", timezone: "Europe/Paris" }),
        new types.CBG({ deviceTime: "2019-05-20T08:59:38", timezone: "Europe/Paris" }),
        new types.Wizard({ deviceTime: "2019-05-22T14:33:15", timezone: "Europe/Paris" }),
        bolus,
        new types.SMBG({ deviceTime: "2019-05-26T11:20:27", timezone: "Europe/Paris" }),
        new types.Basal({ deviceTime: "2019-05-26T10:20:27", timezone: "Europe/Paris" }),
        new types.Basal({ deviceTime: "2019-05-26T11:20:27", timezone: "Europe/Paris", deliveryType: "automated" }),
        new types.Food({ deviceTime: "2019-05-26T10:00:01", timezone: "Europe/Paris" }),
        new types.PumpSettings({ deviceTime: "2019-05-26T08:59:38", timezone: "Europe/Paris" }),
        new types.CBG({ deviceTime: "2019-05-26T08:59:38", timezone: "Europe/Paris" }),
        new types.CBG({ deviceTime: "2019-05-27T08:59:38", timezone: "Europe/Paris" }), // Should be left over
      ];

      tidelineData = new TidelineData({ timePrefs: { timezoneAware: true, timezoneName: "Europe/Paris" } });
      await tidelineData.addData(data);
    });

    beforeEach(() => {
      const startDate = moment.tz("2019-05-20", "Europe/Paris").locale("fr").startOf("week");
      const endDate = moment.tz("2019-05-20", "Europe/Paris").locale("fr").endOf("week");
      filtered = selectDailyViewData(tidelineData, startDate, endDate);
      latestFilteredDate = _.last(_.keys(filtered.dataByDate));
      latestFilteredData = filtered.dataByDate[latestFilteredDate];
    });

    it("should export a selectDailyViewData function", () => {
      expect(selectDailyViewData).to.be.a("function");
    });

    it("should return the most recent data available", () => {
      const expectDates = ["2019-05-20", "2019-05-21", "2019-05-22", "2019-05-23", "2019-05-24", "2019-05-25", "2019-05-26"];
      expect(latestFilteredDate).to.be.equal("2019-05-26");
      const dataByDate = _.keys(filtered.dataByDate);
      expect(dataByDate, JSON.stringify(dataByDate)).to.be.deep.equal(expectDates);
      expect(latestFilteredData.bounds).to.be.deep.equal([1558821600000, 1558907999999]);
    });

    it("should return basal data by date", () => {
      expect(latestFilteredData.data.basal).to.be.an("array");
      expect(latestFilteredData.data.basal.length > 0).to.be.true;
    });

    it("should return basal sequence data by date", () => {
      expect(latestFilteredData.data.basalSequences).to.be.an("array");
      expect(latestFilteredData.data.basalSequences.length > 0).to.be.true;
    });

    it("should return time in loop mode data by date", () => {
      expect(latestFilteredData.data.timeInAutoRatio).to.be.an("object");
      expect(latestFilteredData.data.timeInAutoRatio).to.have.all.keys(["automated", "manual"]);
    });

    it("should return bolus data by date", () => {
      expect(latestFilteredData.data.bolus).to.be.an("array");
      expect(latestFilteredData.data.bolus.length > 0).to.be.true;
    });

    it("should return cbg data by date", () => {
      expect(latestFilteredData.data.cbg).to.be.an("array");
      expect(latestFilteredData.data.cbg.length > 0).to.be.true;
    });

    it("should return smbg data by date", () => {
      expect(latestFilteredData.data.smbg).to.be.an("array");
      expect(latestFilteredData.data.smbg.length > 0).to.be.true;
    });

    it("should return the bg range", () => {
      expect(filtered.bgRange).to.be.an("array");
      expect(filtered.bgRange.length).to.equal(2);
    });

    it("should return the bolus range", () => {
      expect(filtered.bolusRange).to.be.an("array");
      expect(filtered.bolusRange.length).to.equal(2);
    });

    it("should return the basal range", () => {
      expect(filtered.basalRange).to.be.an("array");
      expect(filtered.basalRange.length).to.equal(2);
    });

    it("should return the latest pump upload", () => {
      expect(filtered.latestPumpUpload).to.be.an("object");
      expect(filtered.latestPumpUpload).to.equal(tidelineData.grouped.upload[0]);
    });
  });

  describe("generatePDFStats", () => {
    it("should generate stats for basics data", () => {
      const dataUtils = new DataUtil([], {
        latestPump: {
          manufacturer: "Diabeloop",
          deviceModel: "DBLG1",
        },
      });
      const data = {
        basics: {
          total: 0,
          dateRange: ["2022-02-01", "2022-02-02"],
        },
      };
      generatePDFStats(data, dataUtils);
      expect(dataUtils.getTimeInRangeData.calledOnce).to.be.true;
      expect(dataUtils.getReadingsInRangeData.calledOnce).to.be.true;
      expect(dataUtils.getBasalBolusData.calledOnce).to.be.true;
      expect(dataUtils.getTimeInAutoData.calledOnce).to.be.true;
      expect(dataUtils.getCarbsData.calledOnce).to.be.true;
      expect(dataUtils.getTotalInsulinAndWeightData.calledOnce).to.be.true;
      expect(dataUtils.getAverageGlucoseData.calledOnce).to.be.true;
      expect(dataUtils.getGlucoseManagementIndicatorData.calledOnce).to.be.true;
    });

    it("should generate stats for daily data", () => {
      const dataUtils = new DataUtil([], {
        latestPump: {
          manufacturer: "Diabeloop",
          deviceModel: "DBLG1",
        },
      });
      const data = {
        daily: {
          total: 0,
          dataByDate: {
            "2022-02-01": {
              endpoints: ["2022-02-01", "2022-02-02"],
            },
          },
        },
      };
      generatePDFStats(data, dataUtils);
      expect(dataUtils.getTimeInRangeData.calledOnce).to.be.true;
      expect(dataUtils.getAverageGlucoseData.calledOnce).to.be.true;
      expect(dataUtils.getBasalBolusData.calledOnce).to.be.true;
      expect(dataUtils.getTimeInAutoData.calledOnce).to.be.true;
      expect(dataUtils.getCarbsData.calledOnce).to.be.true;
    });
  });
});
