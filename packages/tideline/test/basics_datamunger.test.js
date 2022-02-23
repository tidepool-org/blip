/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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

import _ from "lodash";
import { assert, expect } from "chai";

import * as constants from "../plugins/blip/basics/logic/constants";
import togglableState from "../plugins/blip/basics/TogglableState";
import datamunger from "../plugins/blip/basics/logic/datamunger";

describe("basics datamunger", function() {
  var bgClasses = {
    "very-low": {boundary: 10},
    "low": {boundary: 20},
    "target": {boundary: 30},
    "high": {boundary: 40},
    "very-high": {boundary: 50}
  };
  var oneWeekDates = [{
    date: "2015-09-07",
    type: "past"
  }, {
    date: "2015-09-08",
    type: "past"
  }, {
    date: "2015-09-09",
    type: "past"
  }, {
    date: "2015-09-10",
    type: "past"
  }, {
    date: "2015-09-11",
    type: "past"
  }, {
    date: "2015-09-12",
    type: "dayOfUpload"
  }, {
    date: "2015-09-13",
    type: "future"
  }];
  var countSiteChangesByDay = {
    "2015-09-05": {count: 1},
    "2015-09-08": {count: 1, data: "a"},
    "2015-09-12": {count: 2, data: "b"}
  };
  var siteChangeSections = {
    siteChanges: {
      id: "siteChanges",
      togglable: togglableState.off,
      settingsTogglable: togglableState.closed,
      selectorOptions: {
        primary: { key: constants.SITE_CHANGE_RESERVOIR, label: "Reservoir Change" },
        rows: [
          [
            { key: constants.SITE_CHANGE_TUBING, label: "Tube Primes" },
            { key: constants.SITE_CHANGE_CANNULA, label: "Cannula Fills" },
          ],
        ],
      },
      type: constants.SITE_CHANGE_RESERVOIR,
    },
  };

  var dm = datamunger(bgClasses);
  it("should return an object", function() {
    assert.isObject(dm);
  });

  describe("getLatestPumpUploaded", function() {
    it("should be a function", function() {
      assert.isFunction(dm.getLatestPumpUploaded);
    });

    it("should return a pump with proper data", function() {
      var patientData = {
        grouped: {
          upload: [
            {
              deviceTags: ["bgm"],
              source: "BGM",
            },
            {
              deviceTags: ["insulin-pump"],
              source: constants.TANDEM,
            },
            {
              deviceTags: ["insulin-pump", "bgm"],
              source: constants.INSULET,
            },
            {
              deviceTags: ["cgm"],
              source: "CGM",
            },
          ],
        },
      };
      expect(dm.getLatestPumpUploaded(patientData)).to.equal(constants.INSULET);
    });

    it("should return null without proper data", function() {
      var patientData = {
        grouped: {
          pumpSettings: [],
        },
      };
      expect(dm.getLatestPumpUploaded(patientData)).to.equal(null);
    });
  });

  describe("processInfusionSiteHistory", function() {
    it("should be a function", function() {
      assert.isFunction(dm.processInfusionSiteHistory);
    });

    it("should return null without latest pump", function() {
      var basicsData = {
        data: {},
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      expect(dm.processInfusionSiteHistory(basicsData, null, patient, perms)).to.equal(null);
    });

    it("should return that a user has set their site change source settings", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.hasSiteChangeSourceSettings).to.equal(true);
    });

    it("should return that a user has not set their site change source settings", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {},
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.hasSiteChangeSourceSettings).to.equal(false);
    });

    it("should return that logged in user has permission to update patient settings", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.canUpdateSettings).to.equal(true);
    });

    it("should return that logged in user does not have permission to update patient settings", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = {};

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.selectorMetaData.canUpdateSettings).to.equal(false);
    });

    it("should set siteChanges type to cannulaPrime", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
          [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_CANNULA);
    });

    it("should set siteChanges type to tubingPrime", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
          [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_TUBING,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.TANDEM, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_TUBING);
    });

    it("should set siteChanges type to reservoirChange", function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_TUBING,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_RESERVOIR);
    });

    var pumps = [constants.ANIMAS, constants.MEDTRONIC, constants.TANDEM];
    pumps.forEach(function(pump) {
      it("should set siteChanges type to undeclared, and settings to be open, when no preference has been saved and pump is " + pump, function() {
        var basicsData = {
          data: {
            [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
            [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
          },
          days: oneWeekDates,
          sections: siteChangeSections,
        };

        var perms = { root: { } };

        var patient = {
          profile: {
            fullName: "Jill Jellyfish",
          },
          settings: {},
        };

        dm.processInfusionSiteHistory(basicsData, pump, patient, perms);
        expect(basicsData.sections.siteChanges.type).to.equal(constants.SECTION_TYPE_UNDECLARED);
        expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.open);
      });

      it("should set siteChanges type to undeclared, and settings to be open, when saved preference is not allowed for " + pump, function() {
        var basicsData = {
          data: {
            [constants.SITE_CHANGE_CANNULA]: {dataByDate: countSiteChangesByDay},
            [constants.SITE_CHANGE_TUBING]: {dataByDate: countSiteChangesByDay},
          },
          days: oneWeekDates,
          sections: siteChangeSections,
        };

        var perms = { root: { } };

        var patient = {
          profile: {
            fullName: "Jill Jellyfish",
          },
          settings: {
            siteChangeSource: constants.SITE_CHANGE_RESERVOIR,
          },
        };

        dm.processInfusionSiteHistory(basicsData, pump, patient, perms);
        expect(basicsData.sections.siteChanges.type).to.equal(constants.SECTION_TYPE_UNDECLARED);
        expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.open);
      });
    });

    it("should set siteChanges type to reservoirChange, and settings to be off, when saved preference is " + constants.SITE_CHANGE_CANNULA + " and pump is " + constants.INSULET, function() {
      var basicsData = {
        data: {
          [constants.SITE_CHANGE_RESERVOIR]: {dataByDate: countSiteChangesByDay}
        },
        days: oneWeekDates,
        sections: siteChangeSections,
      };

      var perms = { root: { } };

      var patient = {
        profile: {
          fullName: "Jill Jellyfish",
        },
        settings: {
          siteChangeSource: constants.SITE_CHANGE_CANNULA,
        },
      };

      dm.processInfusionSiteHistory(basicsData, constants.INSULET, patient, perms);
      expect(basicsData.sections.siteChanges.type).to.equal(constants.SITE_CHANGE_RESERVOIR);
      expect(basicsData.sections.siteChanges.settingsTogglable).to.equal(togglableState.off);
    });
  });

  describe("infusionSiteHistory", function() {
    var bd = {
      data: {reservoirChange: {dataByDate: countSiteChangesByDay}},
      days: oneWeekDates
    };
    it("should be a function", function() {
      assert.isFunction(dm.infusionSiteHistory);
    });

    it("should return an object keyed by date; value is object with attrs type, count, daysSince", function() {
      var res = {};
      oneWeekDates.forEach(function(d) {
        res[d.date] = {type: d.type === "future" ? d.type : "noSiteChange"};
      });
      res["2015-09-08"] = {type: "siteChange", count: 1, daysSince: 3, data: "a"};
      res["2015-09-12"] = {type: "siteChange", count: 2, daysSince: 4, data: "b"};
      res.hasChangeHistory = true;
      expect(dm.infusionSiteHistory(bd, "reservoirChange")).to.deep.equal(res);
    });

    it("should properly calculate the daysSince for the first infusion site change", function() {
      var res2 = {};
      oneWeekDates.forEach(function(d) {
        res2[d.date] = {type: d.type === "future" ? d.type : "noSiteChange"};
      });
      res2["2015-09-08"] = {type: "siteChange", count: 1, daysSince: 7, data: "a"};
      res2["2015-09-12"] = {type: "siteChange", count: 1, daysSince: 4, data: "b"};
      res2.hasChangeHistory = true;
      var countSiteChangesByDay2 = {
        "2015-09-01": {count: 1},
        "2015-09-08": {count: 1, data: "a"},
        "2015-09-12": {count: 1, data: "b"}
      };
      var bd2 = {
        data: {reservoirChange: {dataByDate: countSiteChangesByDay2}},
        days: oneWeekDates
      };
      expect(dm.infusionSiteHistory(bd2, "reservoirChange")).to.deep.equal(res2);
    });
  });

  describe("_summarizeTagFn", function() {
    it("should be a function", function() {
      assert.isFunction(dm._summarizeTagFn);
    });

    it("should return a function that can be used with _.each to summarize tags from subtotals", function() {
      var dataObj = {
        dataByDate: {
          "2015-01-01": {
            subtotals: {
              foo: 2,
              bar: 3
            }
          },
          "2015-01-02": {
            subtotals: {
              foo: 10,
              bar: 10
            }
          },
          "2015-01-03": {
            subtotals: {
              foo: 0,
              bar: 0
            }
          }
        }
      };
      var summary = {total: 25};
      _.forEach(["foo", "bar"], dm._summarizeTagFn(dataObj, summary));
      expect(summary).to.deep.equal({
        total: 25,
        foo: {count: 12, percentage: 0.48},
        bar: {count: 13, percentage: 0.52}
      });
    });
  });

  describe("_averageExcludingMostRecentDay", function() {
    it("should be a function", function() {
      assert.isFunction(dm._averageExcludingMostRecentDay);
    });

    it("should calculate an average excluding the most recent day if data exists for it", function() {
      var dataObj = {
        dataByDate: {
          "2015-01-01": {
            total: 2
          },
          "2015-01-02": {
            total: 9
          },
          "2015-01-03": {
            total: 16
          },
          "2015-01-04": {
            total: 1
          }
        }
      };
      expect(dm._averageExcludingMostRecentDay(dataObj, 28, "2015-01-04")).to.equal(9);
    });
  });

  describe("reduceByDay", function() {
    it("should be a function", function() {
      assert.isFunction(dm.reduceByDay);
    });

    describe("crossfilter utils per datatype", function() {
      var then = "2015-01-01T00:00:00.000Z";
      var bd = {
        data: {
          basal: {data: [{type: "basal", deliveryType: "temp", normalTime: then, displayOffset: 0}]},
          bolus: {data: [{type: "bolus", normalTime: then, displayOffset: 0}]},
          reservoirChange: {data: [{type: "deviceEvent", subType: "reservoirChange", normalTime: then, displayOffset: 0}]}
        },
        days: [{date: "2015-01-01", type: "past"}, {date: "2015-01-02", type: "mostRecent"}]
      };
      dm.reduceByDay(bd);
      const types = ["reservoirChange"];
      types.forEach((type) => {
        it("should build crossfilter utils for " + type, () => {
          expect(Object.keys(bd.data[type])).to.deep.equal(["data", "cf", "byLocalDate", "dataByDate"]);
        });

        it("should build a `dataByDate` object for " + type + " with *only* localDates with data as keys", () => {
          expect(Object.keys(bd.data[type].dataByDate)).to.deep.equal(["2015-01-01"]);
        });
      });
    });
  });
});
