/* 
 * == BSD2 LICENSE ==
 */

/*jshint expr: true */
/*global describe, it */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');

var tideline = require('../js/index');
var watson = require('../plugins/data/watson');
var datetime = require('../js/data/util/datetime');
var data = require('../example/data/device-data.json');
// need settings data that has already been reshaped by preprocess (basalSchedules from obj to array)
var settingsData = [{'deviceTime':'2014-06-11T19:51:40','activeBasalSchedule':'Pattern B','bgTarget':[{'high':100,'start':0,'low':80}],'carbRatio':[{'start':0,'amount':18}],'insulinSensitivity':[{'start':0,'amount':85}],'source':'demo','basalSchedules':[{'name':'Pattern B','value':[{'start':0,'rate':0.8},{'start':7200000,'rate':0.85},{'start':14400000,'rate':0.6},{'start':19800000,'rate':0.95},{'start':21600000,'rate':0.75},{'start':34200000,'rate':1},{'start':55800000,'rate':0.75},{'start':72000000,'rate':0.8}]},{'name':'Pattern A','value':[{'start':0,'rate':0.8},{'start':9000000,'rate':0.55},{'start':14400000,'rate':0.75},{'start':18000000,'rate':0.85},{'start':21600000,'rate':0.85},{'start':32400000,'rate':0.8},{'start':55800000,'rate':0.9},{'start':72000000,'rate':0.8}]},{'name':'Standard','value':[{'start':0,'rate':0.55},{'start':7200000,'rate':0.65},{'start':14400000,'rate':0.85},{'start':18000000,'rate':0.75},{'start':21600000,'rate':1},{'start':32400000,'rate':0.8},{'start':54000000,'rate':0.9},{'start':73800000,'rate':0.65}]}],'deviceId':'Demo - 123','type':'settings','id':'576f86d8-958f-4193-be32-27d232ec5a4c','normalTime':'2014-06-11T19:51:40.000Z'},{'deviceTime':'2014-07-06T19:51:40','activeBasalSchedule':'Pattern B','bgTarget':[{'high':100,'start':0,'low':80}],'carbRatio':[{'start':0,'amount':15}],'insulinSensitivity':[{'start':0,'amount':75}],'source':'demo','basalSchedules':[{'name':'Pattern B','value':[{'start':0,'rate':0.8},{'start':7200000,'rate':0.85},{'start':14400000,'rate':0.6},{'start':19800000,'rate':0.95},{'start':21600000,'rate':0.75},{'start':34200000,'rate':1},{'start':55800000,'rate':0.75},{'start':72000000,'rate':0.8}]},{'name':'Pattern A','value':[{'start':0,'rate':0.8},{'start':9000000,'rate':0.55},{'start':14400000,'rate':0.75},{'start':18000000,'rate':0.85},{'start':21600000,'rate':0.85},{'start':32400000,'rate':0.8},{'start':55800000,'rate':0.9},{'start':72000000,'rate':0.8}]},{'name':'Standard','value':[{'start':0,'rate':0.8},{'start':7200000,'rate':0.65},{'start':14400000,'rate':0.75},{'start':18000000,'rate':0.85},{'start':21600000,'rate':1},{'start':32400000,'rate':0.8},{'start':54000000,'rate':0.9},{'start':72000000,'rate':0.8}]}],'deviceId':'Demo - 123','type':'settings','id':'f4af5861-b8fd-488e-a775-a040f1df313e','normalTime':'2014-07-06T19:51:40.000Z'}];
var SegmentUtil = tideline.data.SegmentUtil;
var SettingsUtil = tideline.data.SettingsUtil;
var TidelineData = tideline.TidelineData;

function all(segmentUtil) {
  var arraysToConcat = [];

  arraysToConcat.push(segmentUtil.actual);
  Object.keys(segmentUtil.undelivered).forEach(function(key){
    arraysToConcat.push(segmentUtil.undelivered[key]);
  });

  return Array.prototype.concat.apply([], arraysToConcat);
}

describe('settings utilities', function() {
  var basalSegments = all(new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'})));
  data = _.reject(data, function(d) {
    return d.type === 'basal-rate-segment';
  });
  data = data.concat(basalSegments);
  data = watson.normalizeAll(data);
  var td = new TidelineData(data);
  var diabetesEndpoints = [td.diabetesData[0].normalTime, td.diabetesData[td.diabetesData.length - 1].normalTime];
  var settings = new SettingsUtil(settingsData, diabetesEndpoints);

  describe('settingsUtil.intervals', function() {
    it('should have length two when one settings event in middle of data', function() {
      var settingsUtil = new SettingsUtil(settingsData.slice(0,1), diabetesEndpoints);
      expect(settingsUtil.intervals.length).to.equal(2);
      expect(settingsUtil.intervals[0].settings.confidence).to.equal('uncertain');
      expect(settingsUtil.intervals[1].settings.confidence).not.to.exist;
    });

    it('should have length one when one settings event at end of data', function() {
      var thisSettingsData = settingsData.slice(1,2);
      thisSettingsData[0].normalTime = diabetesEndpoints[1];
      var settingsUtil = new SettingsUtil(thisSettingsData, diabetesEndpoints);
      expect(settingsUtil.intervals.length).to.equal(1);
      expect(settingsUtil.intervals[0].settings.confidence).to.equal('uncertain');
    });

    it('should have length three when two settings events, neither at endpoints', function() {
      expect(settings.intervals.length).to.equal(3);
      expect(settings.intervals[0].settings.confidence).to.equal('uncertain');
      expect(settings.intervals[1].settings.confidence).not.to.exist;
      expect(settings.intervals[2].settings.confidence).not.to.exist;
    });

    it('should be contiguous', function() {
      for (var i = 0; i < settings.intervals.length; ++i) {
        if (i !== settings.intervals.length - 1) {
          expect(settings.intervals[i].end).to.equal(settings.intervals[i + 1].start);
        }
      }
    });
  });

  // describe('findStarts', function() {
  //   it('should be a function', function() {
  //     assert.isFunction(settings.findStarts);
  //   });

  //   it('should return [0,1] on 0 with [0,1,2]', function() {
  //     expect(settings.findStarts(0,[0,1,2]).starts).to.eql([0,1]);
  //   });

  //   it('should return [0,5] on 1 with [0,5,10]', function() {
  //     expect(settings.findStarts(1, [0,5,10]).starts).to.eql([0,5]);
  //   });
  // });

  describe('getAllSchedules', function() {
    it('should be a function', function() {
      assert.isFunction(settings.getAllSchedules);
    });

    it('should return an empty array when given an invalid date range', function() {
      var res = settings.getAllSchedules('','');
      expect(Array.isArray(res)).to.be.true;
      expect(res.length).to.equal(0);
    });

    it('should return a non-empty array for each pattern when given a valid date range', function() {
      var res = settings.getAllSchedules(td.diabetesData[0].normalTime, td.diabetesData[0].normalTime);
      expect(typeof res).to.equal('object');
      for (var key in res) {
        var sched = res[key];
        expect(Array.isArray(sched)).to.be.true;
        expect(sched.length).to.be.above(0);
      }
    });

    it('should return arrays for each schedule continuously spanning diabetes data endpoints when given these endpoints', function() {
      var res = settings.getAllSchedules(diabetesEndpoints[0], diabetesEndpoints[1]);
      for (var key in res) {
        var data = res[key];
        expect(data[0].normalTime).to.equal(diabetesEndpoints[0]);
        expect(data[data.length - 1].normalEnd).to.equal(diabetesEndpoints[1]);
        for (var j = 0; j < data.length; ++j) {
          if (j !== data.length - 1) {
            expect(data[j].normalEnd).to.equal(data[j + 1].normalTime);
          }
        }
      }
    });
  });

  describe('getIntervals', function() {
    it('should return undefined when given an invalid date range', function() {
      expect(settings.getIntervals('2014-01-01T00:00:00.000Z', '2014-01-01T00:00:00.000Z')).to.be.undefined;
    });

    it('should return a settings object when given a valid date range', function() {
      expect(settings.getIntervals(diabetesEndpoints[1], diabetesEndpoints[1])).to.exist;
    });

    it('should return a settings object with uncertain confidence when given a valid date range at beginning of data', function() {
      var currentSettings = settings.getIntervals(diabetesEndpoints[0], diabetesEndpoints[0]);
      expect(currentSettings).to.exist;
      expect(currentSettings[0].settings.confidence).to.equal('uncertain');
    });

    it('should return a settings object with no confidence property when given a valid date range at end of data', function() {
      var currentSettings = settings.getIntervals(diabetesEndpoints[1], diabetesEndpoints[1]);
      expect(currentSettings).to.exist;
      expect(currentSettings[0].settings.confidence).not.to.exist;
    });

    it('should return an array of settings objects when given a date range that crosses a settings deviceTime', function() {
      var before = datetime.addDays(settingsData[0].normalTime, -1);
      var after = datetime.addDays(settingsData[0].normalTime, 1);
      var currentSettings = settings.getIntervals(before, after);
      expect(currentSettings.length).to.equal(2);
    });

    it('should return an array of settings objects continuously spanning diabetes endpoints when given diabetes endpoints', function() {
      var currentSettings = settings.getIntervals(diabetesEndpoints[0], diabetesEndpoints[1]);
      expect(currentSettings.length).to.equal(3);
      for (var i = 0; i < currentSettings.length; ++i) {
        if (i !== currentSettings.length - 1) {
          expect(currentSettings[i].end).to.equal(currentSettings[i + 1].start);
        }
      }
    });
  });
});