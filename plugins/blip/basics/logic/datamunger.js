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

var classifiers = require('./classifiers');
var constants = require('./constants');

module.exports = {
  bgDistribution: function(basicsData, bgClasses) {
    function categorizeBg(d) {
      if (d.value < bgClasses['very-low'].boundary) {
        return 'verylow';
      }
      else if (d.value >= bgClasses['very-low'].boundary &&
        d.value < bgClasses.low.boundary) {
        return 'low';
      }
      else if (d.value >= bgClasses.low.boundary &&
        d.value < bgClasses.target.boundary) {
        return 'target';
      }
      else if (d.value >= bgClasses.target.boundary &&
        d.value < bgClasses.high.boundary) {
        return 'high';
      }
      else if (d.value >= bgClasses.high.boundary) {
        return 'veryhigh';
      }
    }
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
    if (cgm) {
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
    var basals = basicsData.data.basal.data;
    var boluses = basicsData.data.bolus.data;
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
      else {
        return 0;
      }
    }), function(total, insulin) {
      return total + insulin;
    });
    var totalInsulin = sumBasalInsulin + sumBolusInsulin;

    return {
      basalBolusRatio: {
        basal: sumBasalInsulin/totalInsulin,
        bolus: sumBolusInsulin/totalInsulin
      },
      totalDailyDose: totalInsulin/((Date.parse(end) - Date.parse(start))/constants.MS_IN_DAY)
    };
  },
  infusionSiteHistory: function(basicsData) {
    var infusionSitesPerDay = basicsData.data.reservoirChange.dataByDate;
    var allDays = basicsData.days;
    var infusionSiteHistory = {};
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
        }
        else {
          infusionSiteHistory[day.date] = {type: constants.NO_SITE_CHANGE};
        }
      }
    });
    return infusionSiteHistory;
  },
  reduceByDay: function(basicsData) {

    function getLocalDate(d) {
      return sundial.applyOffset(d.time, d.displayOffset).toISOString().slice(0,10);
    }

    function reduceAddMaker(classifier) {
      if (classifier) {
        return function reduceAdd(p, v) {
          ++p.total;
          var tags = classifier(v);
          _.each(tags, function(tag) {
            if (p.subtotals[tag]) {
              p.subtotals[tag] += 1;
            }
            else {
              p.subtotals[tag] = 1;
            }
          });
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
          --p.total;
          var tags = classifier(v);
          _.each(tags, function(tag) {
            p.subtotals[tag] -= 1;
          });
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

    function summarizeTag(typeObj, summary, total) {
      return function(tag) {
        summary[tag] = {count: Object.keys(typeObj.dataByDate)
          .reduce(function(p, date) {
            return p + (typeObj.dataByDate[date].subtotals[tag] || 0);
          }, 0)};
        summary[tag].percentage = summary[tag].count/total;
      };
    }

    for (var type in basicsData.data) {
      var typeObj = basicsData.data[type];
      if (_.includes(['bolus', 'reservoirChange'], type)) {
        typeObj.cf = crossfilter(typeObj.data);
        typeObj.byLocalDate = typeObj.cf.dimension(getLocalDate);
        var classifier = classifiers[type];
        var dataByLocalDate = typeObj.byLocalDate.group().reduce(
          reduceAddMaker(classifier),
          reduceRemoveMaker(classifier),
          reduceInitialMaker(classifier)
        ).all();
        var dataByDateHash = {};
        for (var j = 0; j < dataByLocalDate.length; ++j) {
          var day = dataByLocalDate[j];
          dataByDateHash[day.key] = day.value;
        }
        typeObj.dataByDate = dataByDateHash;
      }
      if (_.includes(['calibration', 'smbg'], type)) {
        if (!basicsData.data.fingerstick) {
          basicsData.data.fingerstick = {};
        }
        basicsData.data.fingerstick[type] = {
          cf: crossfilter(typeObj.data)
        };
        var fsTypeObj = basicsData.data.fingerstick[type];
        fsTypeObj.byLocalDate = fsTypeObj.cf.dimension(getLocalDate);
        var fsDataByLocalDate;
        fsDataByLocalDate = fsTypeObj.byLocalDate.group().reduce(
          reduceAddMaker(classifiers[type]),
          reduceRemoveMaker(classifiers[type]),
          reduceInitialMaker(classifiers[type])
        ).all();
        var fsDataByDateHash = {};
        for (var k = 0; k < fsDataByLocalDate.length; ++k) {
          var fsDay = fsDataByLocalDate[k];
          fsDataByDateHash[fsDay.key] = fsDay.value;
        }
        fsTypeObj.dataByDate = fsDataByDateHash;
      }

      if (_.includes(['bolus'], type)) {
        var section = _.find(basicsData.sections, findSectionContainingType(type));
        var tags = _.rest(_.pluck(section.selectorOptions, 'key'));
        var summary = {total: Object.keys(typeObj.dataByDate)
          .reduce(reduceTotalByDate(typeObj), 0)};
        _.each(tags, summarizeTag(typeObj, summary, summary.total));
        summary.avgPerDay = summary.total/Object.keys(typeObj.dataByDate).length;
        typeObj.summary = summary;
      }
    }

    var fsSection = _.find(basicsData.sections, findSectionContainingType('fingerstick'));
    var fingerstickData = basicsData.data.fingerstick;
    var fsSummary = {total: 0};
    _.each(['calibration', 'smbg'], function(fsCategory) {
      fsSummary[fsCategory] = Object.keys(fingerstickData[fsCategory].dataByDate)
        .reduce(function(p, date) {
          var dateData = fingerstickData[fsCategory].dataByDate[date];
          return p + (dateData.total || dateData.count);
        }, 0);
      fsSummary.total += fsSummary[fsCategory];
    });
    fingerstickData.summary = fsSummary;
    var fsTags = _.pluck(_.filter(fsSection.selectorOptions, function(opt) {
      return opt.path === 'smbg' && !opt.primary;
    }), 'key');
    _.each(fsTags, summarizeTag(fingerstickData.smbg, fsSummary, fsSummary.smbg));
  }
};
