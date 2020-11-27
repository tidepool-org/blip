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

/* jshint esversion:6 */

var _ = require('lodash');
var crossfilter = require('crossfilter2');

var sundial = require('sundial');

var classifiersMkr = require('./classifiers');
var constants = require('./constants');
var { MGDL_UNITS } = require('../../../../js/data/util/constants');
var { getLatestPumpUpload } = require('../../../../js/data/util/device');

var basicsActions = require('./actions');
var togglableState = require('../TogglableState');

var BGUtil = require('../../../../js/data/bgutil');
var BasalUtil = require('../../../../js/data/basalutil');
var basalUtil = new BasalUtil();

module.exports = function(bgClasses, bgUnits = MGDL_UNITS) {

  var classifiers = classifiersMkr(bgClasses, bgUnits);
  var weightedCGMCount = new BGUtil([], { DAILY_MIN: constants.CGM_IN_DAY * 0.75 }).weightedCGMCount;

  return {
    getLatestPumpUploaded: function(patientData) {
      var latestPump = getLatestPumpUpload(patientData.grouped.upload);

      if (latestPump && latestPump.hasOwnProperty('source')) {
        return latestPump.source;
      }

      return null;
    },
    processInfusionSiteHistory: function(basicsData, latestPump, patient, permissions) {
      if (!latestPump) {
        return null;
      }

      var {
        profile: {
          fullName,
        },
        settings,
      } = patient;

      var canUpdateSettings = permissions.hasOwnProperty('custodian') || permissions.hasOwnProperty('root');
      var hasSiteChangeSourceSettings = settings && settings.hasOwnProperty('siteChangeSource');

      basicsData.sections.siteChanges.selectorMetaData = {
        latestPump: latestPump,
        canUpdateSettings,
        hasSiteChangeSourceSettings,
        patientName: fullName,
      };

      if (latestPump === constants.ANIMAS || latestPump === constants.MEDTRONIC || latestPump === constants.TANDEM) {
        basicsData.data.cannulaPrime.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_CANNULA);
        basicsData.data.tubingPrime.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_TUBING);

        if (hasSiteChangeSourceSettings && ([constants.SITE_CHANGE_CANNULA, constants.SITE_CHANGE_TUBING].indexOf(settings.siteChangeSource) >= 0)) {
          basicsData.sections.siteChanges.type = settings.siteChangeSource;
          basicsData.sections.siteChanges.selectorOptions = basicsActions.setSelected(basicsData.sections.siteChanges.selectorOptions, settings.siteChangeSource);
        }
        else {
          basicsData.sections.siteChanges.type = constants.SECTION_TYPE_UNDECLARED;
          basicsData.sections.siteChanges.settingsTogglable = togglableState.open;
          basicsData.sections.siteChanges.hasHover = false;
        }
      }
      else if (latestPump === constants.INSULET || latestPump === constants.DIABELOOP) {
        basicsData.data.reservoirChange.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_RESERVOIR);

        basicsData.sections.siteChanges.type = constants.SITE_CHANGE_RESERVOIR;
        basicsData.sections.siteChanges.selector = null;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;
      }
      // CareLink (Medtronic) or other unsupported pump
      else {
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
      _.each(allDays, function(day) {
        if (day.type === 'future') {
          infusionSiteHistory[day.date] = {type: 'future'};
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
              _.each(tags, function(tag) {
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
        else {
          return function reduceAdd(p, v) {
            ++p.count;
            p.data.push(v);
            return p;
          };
        }
      }

      function reduceRemoveMaker(classifier) {
        if (classifier) {
          return function reduceRemove(p, v) {
            var tags = classifier(v);
            if (!_.isEmpty(tags)) {
              --p.total;
              _.each(tags, function(tag) {
                p.subtotals[tag] -= 1;
              });
            }
            _.remove(p.data, function(d) {
              return d.id === v.id;
            });
            return p;
          };
        }
        else {
          return function reduceRemove(p, v) {
            --p.count;
            _.remove(p.data, function(d) {
              return d.id === v.id;
            });
            return p;
          };
        }
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
        else {
          return function reduceInitial() {
            return {
              count: 0,
              data: []
            };
          };
        }
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
      return _.map(row, 'key');
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

      function findSectionContainingType(type) {
        return function(section) {
          if (section.column === 'left') {
            return false;
          }
          return section.type === type;
        };
      }

      function reduceTotalByDate(typeObj) {
        return function(p, date) {
          return p + typeObj.dataByDate[date].total;
        };
      }

      function countAutomatedBasalEventsForDay(dataForDate) {
        // Get the path groups, and remove the first group, as we only want to
        // track changes into and out of automated delivery
        var basalPathGroups = basalUtil.getBasalPathGroups(dataForDate.data);
        basalPathGroups.shift();

        var events = {
          automatedStop: 0,
          automatedStart: 0,
        };

        _.reduce(basalPathGroups, (acc, group) => {
          const event = group[0].deliveryType === 'automated' ? 'automatedStart' : 'automatedStop';
          acc[event]++;
          return acc;
        }, events);

        _.assign(dataForDate.subtotals, events);
        dataForDate.total += events.automatedStop;
        dataForDate.total += events.automatedStart;
      }

      function countDistinctSuspendsForDay(dataForDate) {
        const suspends = _.filter(dataForDate.data, d => d.deliveryType === 'suspend');

        const result = {
          prev: {},
          distinct: 0,
          skipped: 0,
        };

        _.reduce(suspends, (acc, datum) => {
          // We only want to track non-contiguous suspends as distinct
          if (_.get(acc.prev, 'normalEnd') === datum.normalTime) {
            acc.skipped++;
          } else {
            acc.distinct++;
          }
          acc.prev = datum;
          return acc;
        }, result);

        dataForDate.subtotals.suspend = result.distinct;
        dataForDate.total -= result.skipped;
      }

      var mostRecentDay = _.find(basicsData.days, {type: 'mostRecent'}).date;

      for (var type in basicsData.data) {
        var typeObj = basicsData.data[type];
        if (_.includes(['basal', 'bolus', constants.SITE_CHANGE_RESERVOIR, constants.SITE_CHANGE_TUBING, constants.SITE_CHANGE_CANNULA], type)) {
          typeObj.cf = crossfilter(typeObj.data);
          this._buildCrossfilterUtils(typeObj, type);
        }

        if (_.includes(['calibration', 'smbg'], type)) {
          if (!basicsData.data.fingerstick) {
            basicsData.data.fingerstick = {};
          }
          basicsData.data.fingerstick[type] = {
            cf: crossfilter(typeObj.data)
          };
          this._buildCrossfilterUtils(basicsData.data.fingerstick[type], type);
        }

        if (type === 'basal') {
          _.each(typeObj.dataByDate, countAutomatedBasalEventsForDay);
          _.each(typeObj.dataByDate, countDistinctSuspendsForDay);
        }

        // for basal and boluses, summarize tags and find avg events per day
        if (_.includes(['basal', 'bolus'], type)) {
          // NB: for basals, the totals and avgPerDay are basal *events*
          // that is, temps, suspends, & (not now, but someday) schedule changes
          var section = _.find(basicsData.sections, findSectionContainingType(type));
          // wrap this in an if mostly for testing convenience
          if (section) {
            var tags = _.flatten(_.map(section.selectorOptions.rows, this._getRowKey));

            var summary = {total: Object.keys(typeObj.dataByDate)
              .reduce(reduceTotalByDate(typeObj), 0)};
            _.each(tags, this._summarizeTagFn(typeObj, summary));
            summary.avgPerDay = this._averageExcludingMostRecentDay(
              typeObj,
              summary.total,
              mostRecentDay
            );
            typeObj.summary = summary;
          }
        }
      }

      var fsSection = _.find(basicsData.sections, findSectionContainingType('fingerstick'));
      // wrap this in an if mostly for testing convenience
      if (fsSection) {
        var fingerstickData = basicsData.data.fingerstick;
        var fsSummary = {total: 0};
        // calculate the total events for each type that participates in the fingerstick section
        // as well as an overall total
        _.each(['calibration', 'smbg'], function(fsCategory) {
          fsSummary[fsCategory] = {total: Object.keys(fingerstickData[fsCategory].dataByDate)
            .reduce(function(p, date) {
              var dateData = fingerstickData[fsCategory].dataByDate[date];
              return p + (dateData.total || dateData.count);
            }, 0)};
          fsSummary.total += fsSummary[fsCategory].total;
        });
        fingerstickData.summary = fsSummary;

        var fsTags = _.flatten(fsSection.selectorOptions.rows.map(function(row) {
          return _.map(_.filter(row, function(opt) {
            return opt.path === 'smbg';
          }), 'key');
        }));

        _.each(fsTags, this._summarizeTagFn(fingerstickData.smbg, fsSummary.smbg));
        var smbgSummary = fingerstickData.summary.smbg;
        smbgSummary.avgPerDay = this._averageExcludingMostRecentDay(
          fingerstickData.smbg,
          smbgSummary.total,
          mostRecentDay
        );
      }
    }
  };
};
