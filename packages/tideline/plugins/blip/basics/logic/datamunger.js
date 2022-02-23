/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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
import crossfilter from "crossfilter2";

import sundial from "sundial";

import { MGDL_UNITS } from "../../../../js/data/util/constants";
import { getLatestPumpUpload } from "../../../../js/data/util/device";

import classifiersMkr from "./classifiers";
import * as constants from "./constants";
import basicsActions from "./actions";
import togglableState from "../TogglableState";

function dataMunger(bgClasses, bgUnits = MGDL_UNITS) {
  const classifiers = classifiersMkr(bgClasses, bgUnits);

  return {
    getLatestPumpUploaded: function(patientData) {
      const lastUploadDatum = getLatestPumpUpload(patientData.grouped.upload);
      return _.get(lastUploadDatum, "source", null);
    },

    processInfusionSiteHistory: function(basicsData, latestPump, patient, permissions) {
      if (!latestPump) {
        basicsData.data.reservoirChange = {
          infusionSiteHistory: {},
          data: [],
        };
        return null;
      }

      const settings = _.get(patient, "settings", {});
      const hasSiteChangeSourceSettings = _.get(patient, "settings.siteChangeSource", false) !== false;
      const fullName = _.get(patient, "profile.fullName", null);

      basicsData.sections.siteChanges.selectorMetaData = {
        latestPump: latestPump,
        canUpdateSettings: _.has(permissions, "custodian") || _.has(permissions, "root"),
        hasSiteChangeSourceSettings,
        patientName: fullName,
      };

      if (latestPump === constants.DIABELOOP) {
        if (_.isEmpty(_.get(basicsData, "data.reservoirChange"))) {
          basicsData.data.reservoirChange = {
            infusionSiteHistory: {},
            data: [],
          };
        } else {
          basicsData.data.reservoirChange.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_RESERVOIR);
        }

        basicsData.sections.siteChanges.type = constants.SITE_CHANGE_RESERVOIR;
        basicsData.sections.siteChanges.selector = null;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;

        // Keep the others below for the tests, takes too much time to update them:
      } else if (latestPump === constants.ANIMAS || latestPump === constants.MEDTRONIC || latestPump === constants.TANDEM) {
        basicsData.data.cannulaPrime.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_CANNULA);
        basicsData.data.tubingPrime.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_TUBING);
        if (hasSiteChangeSourceSettings && ([constants.SITE_CHANGE_CANNULA, constants.SITE_CHANGE_TUBING].indexOf(settings.siteChangeSource) >= 0)) {
          basicsData.sections.siteChanges.type = settings.siteChangeSource;
          basicsData.sections.siteChanges.selectorOptions = basicsActions.setSelected(basicsData.sections.siteChanges.selectorOptions, settings.siteChangeSource);
        } else {
          basicsData.sections.siteChanges.type = constants.SECTION_TYPE_UNDECLARED;
          basicsData.sections.siteChanges.settingsTogglable = togglableState.open;
          basicsData.sections.siteChanges.hasHover = false;
        }
      } else if (latestPump === constants.INSULET) {
        basicsData.data.reservoirChange.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_RESERVOIR);

        basicsData.sections.siteChanges.type = constants.SITE_CHANGE_RESERVOIR;
        basicsData.sections.siteChanges.selector = null;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;
      } else {
        // CareLink (Medtronic) or other unsupported pump
        basicsData.data.reservoirChange = {};
        basicsData.sections.siteChanges.type = constants.SITE_CHANGE_RESERVOIR;
        basicsData.sections.siteChanges.selector = null;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;
      }
    },

    infusionSiteHistory: function(basicsData, type) {
      var infusionSitesPerDay = basicsData.data[type].dataByDate;
      var allDays = basicsData.days;
      var infusionSiteHistory = {};
      var hasChangeHistory = false;
      // daysSince does *not* start at zero because we have to look back to the
      // most recent infusion site change prior to the basics-restricted time domain
      var priorSiteChange = _.findLast(_.keys(infusionSitesPerDay), function(date) {
        return date < allDays[0].date;
      });
      var daysSince = (Date.parse(allDays[0].date) - Date.parse(priorSiteChange))/constants.MS_IN_DAY - 1;
      _.forEach(allDays, function(day) {
        if (day.type === "future") {
          infusionSiteHistory[day.date] = {type: "future"};
        }
        else {
          daysSince += 1;
          if (infusionSitesPerDay[day.date] && infusionSitesPerDay[day.date].count >= 1) {
            infusionSiteHistory[day.date] = {
              type: constants.SITE_CHANGE,
              count: infusionSitesPerDay[day.date].count,
              data: infusionSitesPerDay[day.date].data,
              daysSince: daysSince
            };
            daysSince = 0;
            hasChangeHistory = true;
          }
          else {
            infusionSiteHistory[day.date] = {type: constants.NO_SITE_CHANGE};
          }
        }
      });
      infusionSiteHistory.hasChangeHistory = hasChangeHistory;
      return infusionSiteHistory;
    },
    _buildCrossfilterUtils: function(dataObj, type) {

      function getLocalDate(d) {
        return sundial.applyOffset(d.normalTime, d.displayOffset).toISOString().slice(0,10);
      }

      function reduceAddMaker(classifier) {
        if (classifier) {
          return function reduceAdd(p, v) {
            var tags = classifier(v);
            if (!_.isEmpty(tags)) {
              ++p.total;
              _.forEach(tags, function(tag) {
                if (p.subtotals[tag]) {
                  p.subtotals[tag] += 1;
                }
                else {
                  p.subtotals[tag] = 1;
                }
              });
            }
            p.data.push(v);
            return p;
          };
        }

        return function reduceAdd(p, v) {
          ++p.count;
          p.data.push(v);
          return p;
        };
      }

      function reduceRemoveMaker(classifier) {
        if (classifier) {
          return function reduceRemove(p, v) {
            var tags = classifier(v);
            if (!_.isEmpty(tags)) {
              --p.total;
              _.forEach(tags, function(tag) {
                p.subtotals[tag] -= 1;
              });
            }
            _.remove(p.data, function(d) {
              return d.id === v.id;
            });
            return p;
          };
        }

        return function reduceRemove(p, v) {
          --p.count;
          _.remove(p.data, function(d) {
            return d.id === v.id;
          });
          return p;
        };
      }

      function reduceInitialMaker(classifier) {
        if (classifier) {
          return function reduceInitial() {
            return {
              total: 0,
              subtotals: {},
              data: []
            };
          };
        }

        return function reduceInitial() {
          return {
            count: 0,
            data: []
          };
        };
      }

      dataObj.byLocalDate = dataObj.cf.dimension(getLocalDate);
      var classifier = classifiers[type];
      var dataByLocalDate = dataObj.byLocalDate.group().reduce(
        reduceAddMaker(classifier),
        reduceRemoveMaker(classifier),
        reduceInitialMaker(classifier)
      ).all();
      var dataByDateHash = {};
      for (var j = 0; j < dataByLocalDate.length; ++j) {
        var day = dataByLocalDate[j];
        dataByDateHash[day.key] = day.value;
      }
      dataObj.dataByDate = dataByDateHash;
    },
    _summarizeTagFn: function(dataObj, summary) {
      return function(tag) {
        summary[tag] = {count: Object.keys(dataObj.dataByDate)
          .reduce(function(p, date) {
            return p + (dataObj.dataByDate[date].subtotals[tag] || 0);
          }, 0)};
        summary[tag].percentage = summary[tag].count/summary.total;
      };
    },
    _getRowKey: function(row) {
      return _.map(row, "key");
    },
    _averageExcludingMostRecentDay: function(dataObj, total, mostRecentDay) {
      var mostRecentTotal = dataObj.dataByDate[mostRecentDay] ?
        dataObj.dataByDate[mostRecentDay].total : 0;
      var numDaysExcludingMostRecent = dataObj.dataByDate[mostRecentDay] ?
        Object.keys(dataObj.dataByDate).length - 1 : Object.keys(dataObj.dataByDate).length;
      // TODO: if we end up using this, do we care that this averages only over # of days that *have* data?
      // e.g., if you have a random day in the middle w/no boluses, that day (that 0) will be excluded from average
      return (total - mostRecentTotal)/numDaysExcludingMostRecent;
    },
    reduceByDay: function(basicsData) {
      for (const type in basicsData.data) {
        let typeObj = basicsData.data[type];
        if (_.isEmpty(typeObj)) {
          continue;
        }
        if (_.includes([constants.SITE_CHANGE_RESERVOIR, constants.SITE_CHANGE_CANNULA, constants.SITE_CHANGE_TUBING], type)) {
          typeObj.cf = crossfilter(typeObj.data);
          this._buildCrossfilterUtils(typeObj, type);
        }
      }
    }
  };
}

export default dataMunger;
