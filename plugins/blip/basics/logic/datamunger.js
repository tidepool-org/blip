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

var _ = require('lodash');
var crossfilter = require('crossfilter');

var sundial = require('sundial');

var classifiersMkr = require('./classifiers');
var constants = require('./constants');

var basicsActions = require('./actions');
var togglableState = require('../TogglableState');

module.exports = function(bgClasses) {

  var classifiers = classifiersMkr(bgClasses);

  return {
    bgDistribution: function(basicsData) {
      var categorizeBg = classifiers.categorizeBg;
      function reshapeAsPercentages(grouped, total) {
        var distributionDefaults = {
          verylow: 0,
          low: 0,
          target: 0,
          high: 0,
          veryhigh: 0
        };
        var reshaped = {};
        for (var key in grouped) {
          var group = grouped[key];
          reshaped[key] = group.length/total;
        }
        return _.defaults(reshaped, distributionDefaults);
      }
      var cgm = basicsData.data.cbg;
      var bgm = basicsData.data.smbg;
      var bgDistribution = {};
      if (cgm && !_.isEmpty(cgm.data)) {
        var count = cgm.data.length;
        var spanInDays = (Date.parse(basicsData.dateRange[1]) -
          Date.parse(basicsData.dateRange[0]))/constants.MS_IN_DAY;
        if (count < (constants.CGM_IN_DAY/2 * spanInDays)) {
          bgDistribution.cgmStatus = constants.NOT_ENOUGH_CGM;
        }
        else {
          var categorizedCGM = _.groupBy(cgm.data, categorizeBg);
          bgDistribution.cbg = reshapeAsPercentages(categorizedCGM, count);
          bgDistribution.cgmStatus = constants.CGM_CALCULATED;
        }
      }
      else {
        bgDistribution.cgmStatus = constants.NO_CGM;
      }
      var categorizedBGM = _.groupBy(bgm.data, categorizeBg);
      bgDistribution.smbg = reshapeAsPercentages(categorizedBGM, bgm.data.length);

      return bgDistribution;
    },
    calculateBasalBolusStats: function(basicsData) {
      var pastDays = _.filter(basicsData.days, {type: 'past'});
      // if one or more of the days (excepting most recent) don't have any boluses
      // then don't calculate these stats at all, since may be inaccurate if
      // long-running basals exist
      var mostRecent = _.get(
        _.filter(basicsData.days, {type: 'mostRecent'}),
        [0, 'date'],
        ''
      );
      var pastBolusDays = _.reject(
        Object.keys(basicsData.data.bolus.dataByDate),
        function(date) { return date === mostRecent; }
      );
      if (pastBolusDays.length < pastDays.length) {
        return {
          basalBolusRatio: null,
          averageDailyDose: null,
          totalDailyDose: null,
          averageDailyCarbs: null,
        };
      }
      var boluses = basicsData.data.bolus.data;
      var basals = basicsData.data.basal.data;
      var carbs =  _.filter(basicsData.data.wizard.data, function(wizardEvent) {
        return wizardEvent.carbInput && wizardEvent.carbInput > 0 ;
      });

      var start = basals[0].normalTime;
      if (start < basicsData.dateRange[0]) {
        start = basicsData.dateRange[0];
      }
      var end = basals[basals.length - 1].normalEnd;
      if (end > basicsData.dateRange[1]) {
        end = basicsData.dateRange[1];
      }

      // find the duration of a basal segment that falls within the basicsData.dateRange
      function getDurationInRange(d) {
        if (d.normalTime >= start && d.normalEnd <= end) {
          return d.duration;
        }
        else if (d.normalTime < start) {
          if (d.normalEnd > start) {
            if (d.normalEnd <= end) {
              return Date.parse(d.normalEnd) - Date.parse(start);
            }
            else {
              return Date.parse(end) - Date.parse(start);
            }
          }
          return 0;
        }
        else if (d.normalEnd > end) {
          if (d.normalTime < end) {
            return Date.parse(end) - Date.parse(d.normalTime);
          }
          return 0;
        }
        else {
          return 0;
        }
      }
      var sumDurations = _.reduce(basals, function(total, d) {
        return total + getDurationInRange(d);
      }, 0);
      var sumBasalInsulin = _.reduce(_.map(basals, function(d) {
        return d.rate * (getDurationInRange(d)/constants.MS_IN_HOUR);
      }), function(total, insulin) {
        return total + insulin;
      });

      var sumBolusInsulin = _.reduce(_.map(boluses, function(d) {
        if (d.normalTime >= start && d.normalTime <= end) {
          return (d.extended || 0) + (d.normal || 0);
        }
        return 0;
      }), function(total, insulin) {
        return total + insulin;
      });

      var sumCarbs = _.reduce(_.map(carbs, function(d) {
        if (d.normalTime >= start && d.normalTime <= end) {
          return d.carbInput;
        }
        return 0;
      }), function(total, carbs) {
        return total + carbs;
      });

      var totalInsulin = sumBasalInsulin + sumBolusInsulin;

      return {
        basalBolusRatio: {
          basal: sumBasalInsulin/totalInsulin,
          bolus: sumBolusInsulin/totalInsulin
        },
        averageDailyDose: {
          basal: sumBasalInsulin/((Date.parse(end) - Date.parse(start))/constants.MS_IN_DAY),
          bolus: sumBolusInsulin/((Date.parse(end) - Date.parse(start))/constants.MS_IN_DAY)
        },
        totalDailyDose: totalInsulin/((Date.parse(end) - Date.parse(start))/constants.MS_IN_DAY),
        averageDailyCarbs: sumCarbs/((Date.parse(end) - Date.parse(start))/constants.MS_IN_DAY)
      };
    },
    getLatestPumpUploaded: function(patientData) {
      var latestPump = _.last(patientData.grouped.pumpSettings);

      if (latestPump && latestPump.hasOwnProperty('source')) {
        return latestPump.source;
      }

      return null;
    },
    processInfusionSiteHistory: function(basicsData, latestPump, patient) {
      if (!latestPump) {
        return;
      }

      var {
        permissions,
        profile: {
          fullName,
          settings,
        },
      } = patient;

      var hasUploadPermission = permissions.hasOwnProperty('admin') || permissions.hasOwnProperty('root');

      if (latestPump === constants.ANIMAS || latestPump === constants.TANDEM) {
          basicsData.data.cannulaPrime.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_CANNULA);
          basicsData.data.cannulaPrime.summary = {
            latestPump: latestPump,
            canUpdateSettings: hasUploadPermission,
            patientName: fullName,
          };
          basicsData.data.tubingPrime.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_TUBING);
          basicsData.data.tubingPrime.summary = {
            latestPump: latestPump,
            canUpdateSettings: hasUploadPermission,
            patientName: fullName,
          };

          if (settings && settings.siteChangeSource) {
            basicsData.sections.siteChanges.type = settings.siteChangeSource;
            basicsData.sections.siteChanges.selectorOptions = basicsActions.setSelected(basicsData.sections.siteChanges.selectorOptions, settings.siteChangeSource);
          }
          else {
            basicsData.sections.siteChanges.type = constants.TYPE_UNDECLARED;
            basicsData.sections.siteChanges.settingsTogglable = togglableState.open;
          }
      }
      else if (latestPump === constants.OMNIPOD) {
        basicsData.data.reservoirChange.infusionSiteHistory = this.infusionSiteHistory(basicsData, constants.SITE_CHANGE_RESERVOIR);
        basicsData.data.reservoirChange.summary = {
          latestPump: latestPump,
          canUpdateSettings: hasUploadPermission,
          patientName: fullName,
        };

        basicsData.sections.siteChanges.type = constants.SITE_CHANGE_RESERVOIR;
        basicsData.sections.siteChanges.selector = null;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;
      }
      else {
        // i.e., latestPump === constants.MEDTRONIC, since site changes are currently unsupported
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
      return _.pluck(row, 'key');
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

      function findScheduleChangesForDay(dataForDate) {
        var changes = _.compact(_.uniq(_.pluck(dataForDate.data, 'scheduleName'))).length - 1;
        dataForDate.subtotals.scheduleChange = changes < 0 ? 0 : changes;
      }

      var mostRecentDay = _.find(basicsData.days, {type: 'mostRecent'}).date;

      for (var type in basicsData.data) {
        var typeObj = basicsData.data[type];
        if (_.includes(['basal', 'bolus', 'reservoirChange', 'tubingPrime', 'cannulaPrime'], type)) {
          typeObj.cf = crossfilter(typeObj.data);
          this._buildCrossfilterUtils(typeObj, type);
        }
        // because we're disabling this feature for now
        // see comment in state.js
        // if (type === 'basal') {
        //   _.each(typeObj.dataByDate, findScheduleChangesForDay);
        // }
        if (_.includes(['calibration', 'smbg'], type)) {
          if (!basicsData.data.fingerstick) {
            basicsData.data.fingerstick = {};
          }
          basicsData.data.fingerstick[type] = {
            cf: crossfilter(typeObj.data)
          };
          this._buildCrossfilterUtils(basicsData.data.fingerstick[type], type);
        }

        // because we're disabling this feature for now
        // see comment in state.js
        /*
         * This is inelegant but necessary since reduceAdd will only
         * add to the total basal events if there are tags matched for the day.
         * (Schedule changes aren't counted as "tags".)
         */
        // if (type === 'basal') {
        //   _.each(typeObj.dataByDate, function(dateData) {
        //     if (dateData.subtotals.scheduleChange !== 0) {
        //       dateData.total += dateData.subtotals.scheduleChange;
        //     }
        //   });
        // }

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
          return _.pluck(_.filter(row, function(opt) {
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
