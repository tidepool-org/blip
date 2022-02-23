/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017 Tidepool Project
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

/* eslint-disable max-len */

import _ from "lodash";
import { expect } from "chai";
import { utcDay } from "d3-time";
import { MGDL_UNITS, MMOLL_UNITS } from "tideline";
import * as dataUtils from "../../../src/utils/basics/data";
import * as Types from "../../../data/types";

import {
  NO_CGM,
  CGM_CALCULATED,
  NOT_ENOUGH_CGM,
  SITE_CHANGE_RESERVOIR,
  DIABELOOP,
} from "../../../src/utils/constants";

const bgBounds = {
  [MGDL_UNITS]: {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 70,
    veryLowThreshold: 55,
  },
  [MMOLL_UNITS]: {
    veryHighThreshold: 16.7,
    targetUpperBound: 10.0,
    targetLowerBound: 3.9,
    veryLowThreshold: 3.1,
  },
};

const bgPrefs = {
  [MGDL_UNITS]: {
    bgBounds: bgBounds[MGDL_UNITS],
    bgUnits: MGDL_UNITS,
  },
  [MMOLL_UNITS]: {
    bgBounds: bgBounds[MMOLL_UNITS],
    bgUnits: MMOLL_UNITS,
  },
};

const oneWeekDates = [
  {
    date: "2015-09-07",
    type: "past",
  },
  {
    date: "2015-09-08",
    type: "past",
  },
  {
    date: "2015-09-09",
    type: "past",
  },
  {
    date: "2015-09-10",
    type: "past",
  },
  {
    date: "2015-09-11",
    type: "past",
  },
  {
    date: "2015-09-12",
    type: "dayOfUpload",
  },
  {
    date: "2015-09-13",
    type: "future",
  },
];

const countSiteChangesByDay = {
  "2015-09-05": { count: 1 },
  "2015-09-08": { count: 1, data: "a" },
  "2015-09-12": { count: 2, data: "b" },
};

const siteChangeSections = {
  siteChanges: {
    type: null,
    title: "Infusion site changes",
  }
};

describe("basics data utils", () => {
  describe("determineBgDistributionSource", () => {
    context("has enough cbg data (Dexcom)", () => {
      it("should yield cgmStatus `calculatedCGM` and source `cbg`", () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [];

        const minimumCBGRequiredPerDay = 144;

        for (let i = 0; i < minimumCBGRequiredPerDay; ++i) {
          cbg.push(new Types.CBG({
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "calculatedCGM",
          source: "cbg",
        });

        // remove one cbg point, and it should set status to `notEnoughCGM`
        cbg.pop();

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "notEnoughCGM",
          source: "smbg",
        });
      });
    });

    context("has enough cbg data (FreeStyle Libre)", () => {
      it("should yield cgmStatus `calculatedCGM` and source `cbg`", () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [];

        const minimumCBGRequiredPerDay = 48;

        for (let i = 0; i < minimumCBGRequiredPerDay; ++i) {
          cbg.push(new Types.CBG({
            deviceId: "AbbottFreeStyleLibre-XXX-XXXX",
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "calculatedCGM",
          source: "cbg",
        });

        // remove one cbg point, and it should set status to `notEnoughCGM`
        cbg.pop();

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "notEnoughCGM",
          source: "smbg",
        });
      });
    });

    context("has enough cbg data (Dexcom + FreeStyle Libre mix)", () => {
      it("should yield cgmStatus `calculatedCGM` and source `cbg`", () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [];

        const minimumLibreCBGRequiredPerDay = 48;
        const minimumDexcomCBGRequiredPerDay = 144;

        for (let i = 0; i < minimumLibreCBGRequiredPerDay / 2; ++i) {
          cbg.push(new Types.CBG({
            deviceId: "AbbottFreeStyleLibre-XXX-XXXX",
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        for (let i = 0; i < minimumDexcomCBGRequiredPerDay / 2; ++i) {
          cbg.push(new Types.CBG({
            deviceId: "Dexcom-XXX-XXXX",
            deviceTime: new Date(now.valueOf() + i * 2000).toISOString().slice(0, -5),
            value: 50,
          }));
        }

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "calculatedCGM",
          source: "cbg",
        });

        // remove one cbg point, and it should set status to `notEnoughCGM`
        cbg.pop();

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "notEnoughCGM",
          source: "smbg",
        });
      });
    });

    context("smbg data present, no cbg data", () => {
      it("should yield cgmStatus `noCGM` and source `smbg`", () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 1 }),
          new Types.SMBG({ value: 25 }),
        ];
        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: [] } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "noCGM",
          source: "smbg",
        });
      });
    });

    context("smbg data present, not enough cbg data", () => {
      it("should yield cgmStatus `notEnoughCGM` and source `smbg`", () => {
        const now = new Date();
        const smbg = [
          new Types.SMBG({ value: 1 }),
          new Types.SMBG({ value: 25 }),
        ];
        const cbg = [
          new Types.CBG({ value: 50 }),
        ];
        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "notEnoughCGM",
          source: "smbg",
        });
      });
    });

    context("no smbg data present, not enough cbg data", () => {
      it("should yield cgmStatus `notEnoughCGM` and source `null`", () => {
        const now = new Date();
        const smbg = [];
        const cbg = [
          new Types.CBG({ value: 50 }),
        ];

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "notEnoughCGM",
          source: null,
        });
      });
    });

    context("no smbg data present, no cbg data either", () => {
      it("should yield cgmStatus `noCGM` and source `null`", () => {
        const now = new Date();
        const smbg = [];
        const cbg = [];

        expect(dataUtils.determineBgDistributionSource({
          data: { smbg: { data: smbg }, cbg: { data: cbg } },
          dateRange: [utcDay.floor(now), utcDay.ceil(now)],
        })).to.deep.equal({
          cgmStatus: "noCGM",
          source: null,
        });
      });
    });
  });

  describe("cgmStatusMessage", () => {
    it("should return an appropriate status message when provided a valid status string", () => {
      expect(dataUtils.cgmStatusMessage(NO_CGM)).to.equal("Showing BGM data (no CGM)");
      expect(dataUtils.cgmStatusMessage(NOT_ENOUGH_CGM)).to.equal("Showing BGM data (not enough CGM)");
      expect(dataUtils.cgmStatusMessage(CGM_CALCULATED)).to.equal("Showing CGM data");
    });

    it("should return an empty status message when not provided a valid status string", () => {
      expect(dataUtils.cgmStatusMessage("foo")).to.equal("");
    });
  });

  describe("getLatestPumpUploaded", () => {
    it("should return the source of the latest pump uploaded", () => {
      const data = {
        upload: { data: [new Types.Upload({ deviceTags: ["insulin-pump"], source: "Insulet" })] },
      };

      expect(dataUtils.getLatestPumpUploaded({ data })).to.equal("Insulet");
    });

    it("should return null if there is no pump data uploaded", () => {
      const data = {
        upload: { data: [] },
      };

      expect(dataUtils.getLatestPumpUploaded({ data })).to.be.null;
    });
  });

  describe("getInfusionSiteHistory", () => {
    const bd = {
      data: { reservoirChange: { dataByDate: countSiteChangesByDay } },
      days: oneWeekDates,
    };

    it("should return an object keyed by date; value is object with attrs type, count, daysSince", () => {
      const res = {};
      _.forEach(oneWeekDates, d => {
        res[d.date] = { type: d.type === "future" ? d.type : "noSiteChange" };
      });
      res["2015-09-08"] = { type: "siteChange", count: 1, daysSince: 3, data: "a" };
      res["2015-09-12"] = { type: "siteChange", count: 2, daysSince: 4, data: "b" };
      res.hasChangeHistory = true;
      expect(dataUtils.getInfusionSiteHistory(bd, "reservoirChange")).to.deep.equal(res);
    });

    it("should properly calculate the daysSince for the first infusion site change", () => {
      const res2 = {};
      _.forEach(oneWeekDates, d => {
        res2[d.date] = { type: d.type === "future" ? d.type : "noSiteChange" };
      });
      res2["2015-09-08"] = { type: "siteChange", count: 1, daysSince: 7, data: "a" };
      res2["2015-09-12"] = { type: "siteChange", count: 1, daysSince: 4, data: "b" };
      res2.hasChangeHistory = true;
      const countSiteChangesByDay2 = {
        "2015-09-01": { count: 1 },
        "2015-09-08": { count: 1, data: "a" },
        "2015-09-12": { count: 1, data: "b" },
      };
      const bd2 = {
        data: { reservoirChange: { dataByDate: countSiteChangesByDay2 } },
        days: oneWeekDates,
      };
      expect(dataUtils.getInfusionSiteHistory(bd2, "reservoirChange")).to.deep.equal(res2);
    });
  });

  describe("processInfusionSiteHistory", () => {
    it("should return basics data unchanged without latest pump", () => {
      const basicsData = {
        data: {},
        sections: siteChangeSections,
      };

      const patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
      };

      const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
      expect(result).to.deep.equal(basicsData);
    });

    it("should set the siteChanges", () => {
      const basicsData = {
        data: {
          [SITE_CHANGE_RESERVOIR]: { dataByDate: countSiteChangesByDay },
          upload: { data: [new Types.Upload({ deviceTags: ["cgm", "insulin-pump"], source: DIABELOOP })] },
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      const patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
      };

      const result = dataUtils.processInfusionSiteHistory(basicsData, patient);
      expect(result.sections.siteChanges.type).to.equal(SITE_CHANGE_RESERVOIR);
    });
  });

  describe("reduceByDay", () => {
    describe("crossfilter utils per datatype", () => {
      const then = "2015-01-01T00:00:00.000Z";
      const bd = {
        data: {
          reservoirChange: { data: [{ type: "deviceEvent", subType: "reservoirChange", normalTime: then, displayOffset: 0 }] },
        },
        days: [{ date: "2015-01-01", type: "past" }, { date: "2015-01-02", type: "mostRecent" }],
      };
      const result = dataUtils.reduceByDay(bd, bgPrefs[MGDL_UNITS]);
      const types = ["reservoirChange"];
      _.forEach(types, type => {
        it(`should build crossfilter utils for ${type}`, () => {
          expect(_.keys(result.data[type])).to.deep.equal(["data", "cf", "byLocalDate", "dataByDate"]);
        });

        it(`should build a \`dataByDate\` object for ${type} with *only* localDates with data as keys`, () => {
          expect(_.keys(result.data[type].dataByDate)).to.deep.equal(["2015-01-01"]);
        });
      });
    });

    describe("summarizeTagFn", () => {
      it("should return a function that can be used with _.each to summarize tags from subtotals", () => {
        const dataObj = {
          dataByDate: {
            "2015-01-01": {
              subtotals: {
                foo: 2,
                bar: 3,
              },
            },
            "2015-01-02": {
              subtotals: {
                foo: 10,
                bar: 10,
              },
            },
            "2015-01-03": {
              subtotals: {
                foo: 0,
                bar: 0,
              },
            },
          },
        };

        const summary = { total: 25 };

        _.forEach(["foo", "bar"], dataUtils.summarizeTagFn(dataObj, summary));

        expect(summary).to.deep.equal({
          total: 25,
          foo: { count: 12, percentage: 0.48 },
          bar: { count: 13, percentage: 0.52 },
        });
      });
    });

    describe("averageExcludingMostRecentDay", () => {
      it("should calculate an average excluding the most recent day if data exists for it", () => {
        const dataObj = {
          dataByDate: {
            "2015-01-01": {
              total: 2,
            },
            "2015-01-02": {
              total: 9,
            },
            "2015-01-03": {
              total: 16,
            },
            "2015-01-04": {
              total: 1,
            },
          },
        };
        expect(dataUtils.averageExcludingMostRecentDay(dataObj, 28, "2015-01-04")).to.equal(9);
      });
    });
  });

  describe("defineBasicsSections", () => {
    const sectionNames = [
      "basals",
      "basalBolusRatio",
      "bgDistribution",
      "boluses",
      "fingersticks",
      "siteChanges",
      "totalDailyDose",
      "timeInAutoRatio",
      "averageDailyCarbs",
    ];

    it("should return an object with all required basics section keys with the default properties set", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS]);
      expect(result).to.have.all.keys(sectionNames);
    });

    it("should set titles for each section", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS]);
      _.forEach(sectionNames, (section) => {
        expect(result[section].title).to.be.a("string");
      });
    });

    it("should set the veryLow and veryHigh fingerstick filter labels correctly for mg/dL data", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS]);
      const veryHighFilter = _.find(result.fingersticks.dimensions, { key: "veryHigh" });
      const veryLowFilter = _.find(result.fingersticks.dimensions, { key: "veryLow" });
      expect(veryHighFilter.label).to.equal("Above 300 mg/dL");
      expect(veryLowFilter.label).to.equal("Below 55 mg/dL");
    });

    it("should set the veryLow and veryHigh fingerstick filter labels correctly for mmol/L data", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MMOLL_UNITS]);
      const veryHighFilter = _.find(result.fingersticks.dimensions, { key: "veryHigh" });
      const veryLowFilter = _.find(result.fingersticks.dimensions, { key: "veryLow" });
      expect(veryHighFilter.label).to.equal("Above 16.7 mmol/L");
      expect(veryLowFilter.label).to.equal("Below 3.1 mmol/L");
    });

    it("should set the label for the `automatedStop` filter based on the manufacturer", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MMOLL_UNITS], "medtronic");
      const automatedStopFilter = _.find(result.basals.dimensions, { key: "automatedStop" });
      expect(automatedStopFilter.label).to.equal("Auto Mode Exited");
    });

    it("should set default label for the `automatedStop` filter when missing manufacturer", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MMOLL_UNITS]);
      const automatedStopFilter = _.find(result.basals.dimensions, { key: "automatedStop" });
      expect(automatedStopFilter.label).to.equal("Automated Exited");
    });

    it("should activate both `basalBolusRatio` and `timeInAutoRatio` for automated-basal devices", () => {
      const result = dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], DIABELOOP, "1780");
      expect(result.basalBolusRatio.active).to.be.true;
      expect(result.timeInAutoRatio.active).to.be.true;
    });
  });

  describe("generateCalendarDayLabels", () => {
    it("should generate an array of formatted day labels", () => {
      const result = dataUtils.generateCalendarDayLabels(oneWeekDates);
      expect(result).to.eql(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    });
  });

  describe("disableEmptySections", () => {
    const basicsData = {
      data: {
        cbg: { data: [new Types.CBG()] },
        smbg: { data: [] },
        basal: { data: [] },
        bolus: { data: [] },
        reservoirChange: { dataByDate: {} },
        upload: { data: [new Types.Upload({ deviceTags: ["cgm", "insulin-pump"], source: DIABELOOP })] },
      },
      days: oneWeekDates,
      sections: dataUtils.defineBasicsSections(bgPrefs[MGDL_UNITS], DIABELOOP, "1780"),
    };

    it("should disable sections for which there is no data available", () => {
      // all sections (including timeInAutoRatio since it's an automated-basal device) active by default
      expect(basicsData.sections.basals.active).to.be.true;
      expect(basicsData.sections.boluses.active).to.be.true;
      expect(basicsData.sections.siteChanges.active).to.be.true;
      expect(basicsData.sections.bgDistribution.active).to.be.true;
      expect(basicsData.sections.totalDailyDose.active).to.be.true;
      expect(basicsData.sections.basalBolusRatio.active).to.be.true;
      expect(basicsData.sections.timeInAutoRatio.active).to.be.true;
      expect(basicsData.sections.averageDailyCarbs.active).to.be.true;
      const processedBasicsData = dataUtils.processInfusionSiteHistory(basicsData, {});
      const result = dataUtils.disableEmptySections(processedBasicsData);

      // basals gets disabled when no data
      expect(result.sections.basals.disabled).to.be.true;

      // boluses gets disabled when no data
      expect(result.sections.boluses.disabled).to.be.true;

      // siteChanges gets disabled when no data
      expect(result.sections.siteChanges.disabled).to.be.true;

      // bgDistribution gets disabled when no data
      expect(result.sections.bgDistribution.disabled).to.be.true;

      // totalDailyDose gets disabled when no data
      expect(result.sections.totalDailyDose.disabled).to.be.true;

      // basalBolusRatio gets disabled when no data
      expect(result.sections.basalBolusRatio.disabled).to.be.true;

      // timeInAutoRatio gets disabled when no data
      expect(result.sections.timeInAutoRatio.disabled).to.be.true;

      // averageDailyCarbs gets disabled when no data
      expect(result.sections.averageDailyCarbs.disabled).to.be.true;
    });

    it("should set empty text for sections for which there is no data available", () => {
      // all sections emptyText undefined by default
      expect(basicsData.sections.basals.emptyText).to.be.undefined;
      expect(basicsData.sections.boluses.emptyText).to.be.undefined;
      expect(basicsData.sections.siteChanges.emptyText).to.be.undefined;
      expect(basicsData.sections.bgDistribution.emptyText).to.be.undefined;
      expect(basicsData.sections.totalDailyDose.emptyText).to.be.undefined;
      expect(basicsData.sections.basalBolusRatio.emptyText).to.be.undefined;
      expect(basicsData.sections.timeInAutoRatio.emptyText).to.be.undefined;
      expect(basicsData.sections.averageDailyCarbs.emptyText).to.be.undefined;

      const processedBasicsData = dataUtils.processInfusionSiteHistory(basicsData, {});
      const result = dataUtils.disableEmptySections(processedBasicsData);

      // basals gets emptyText set when no data
      expect(result.sections.basals.emptyText).to.be.a("string");

      // boluses gets emptyText set when no data
      expect(result.sections.boluses.emptyText).to.be.a("string");

      // siteChanges gets emptyText set when no data
      expect(result.sections.siteChanges.emptyText).to.be.a("string");

      // bgDistribution gets emptyText set when no data
      expect(result.sections.bgDistribution.emptyText).to.be.a("string");

      // totalDailyDose gets emptyText set when no data
      expect(result.sections.totalDailyDose.emptyText).to.be.a("string");

      // basalBolusRatio gets emptyText set when no data
      expect(result.sections.basalBolusRatio.emptyText).to.be.a("string");

      // basalBolusRatio gets emptyText set when no data
      expect(result.sections.timeInAutoRatio.emptyText).to.be.a("string");

      // averageDailyCarbs gets emptyText set when no data
      expect(result.sections.averageDailyCarbs.emptyText).to.be.a("string");
    });
  });
});
/* eslint-enable max-len */
