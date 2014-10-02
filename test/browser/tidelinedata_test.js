/*
 * == BSD2 LICENSE ==
 */

var _ = require('lodash');

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var TidelineCrossFilter = require('../../js/data/util/tidelinecrossfilter');
var types = require('../../dev/testpage/types');

var TidelineData = require('../../js/tidelinedata');

describe('TidelineData', function() {
  var td = new TidelineData([]);
  it('should be a function', function() {
    assert.isFunction(TidelineData);
  });

  it('should be a (newable) constructor', function() {
    expect(td).to.exist;
  });

  it('should have a `data` attribute that is an array', function() {
    assert.isArray(td.data);
  });

  it('should have a `filterData` attribute that is a TidelineCrossFilter', function() {
    assert.isObject(td.filterData);
    expect(td.filterData).to.be.an.instanceOf(TidelineCrossFilter);
  });

  // NB: eventually we probably do want to support plotting messages only
  // so TODO: remove this once we do
  it('should be able to handle message data only by returning empty tidelineData', function() {
    var now = new Date().toISOString();
    var data = [new types.Message()];
    var messageOnly = new TidelineData(data);
    expect(messageOnly.data.length).to.equal(0);
  });

  var dataTypes = {
    basal: new types.Basal(),
    bolus: new types.Bolus(),
    cbg: new types.CBG(),
    settings: new types.Settings(),
    smbg: new types.SMBG(),
    wizard: new types.Wizard()
  };

  _.each(Object.keys(dataTypes), function(dType) {
    it('should be able to handle only ' + dType + ' without error', function() {
      var data = [dataTypes[dType]];
      var single = new TidelineData(data);
      expect(single.data.length).to.be.above(1);
    });
  });

  describe('addDatum', function() {
    it('should be a function', function() {
      assert.isFunction(td.addDatum);
    });

    it('should increase the length of the group data and data by one', function() {
      var origData = [new types.Bolus()];
      var toAdd = new TidelineData(origData);
      var origLen = toAdd.data.length;
      var bolusLen = toAdd.grouped.bolus.length;
      toAdd.addDatum(new types.Bolus());
      expect(toAdd.data.length - 1).to.equal(origLen);
      expect(toAdd.grouped.bolus.length - 1).to.equal(bolusLen);
    });
  });

  describe('editDatum', function() {
    var message = new types.Message();
    var origMessage = _.clone(message);
    var editedMessage = _.clone(origMessage);
    var d = new Date(editedMessage.time);
    d.setUTCHours(d.getUTCHours() + 1);
    editedMessage.time = d.toISOString();
    var n = new Date(editedMessage.normalTime);
    n.setUTCHours(n.getUTCHours() + 1);
    editedMessage.normalTime = n.toISOString();

    it('should be a function', function() {
      assert.isFunction(td.editDatum);
    });

    it('should maintain the length of the group data and data', function() {
      var toEdit = new TidelineData([message, new types.CBG()]);
      var origLen = toEdit.data.length;
      var messageLen = toEdit.grouped.message.length;
      toEdit.editDatum(editedMessage, 'time');
      expect(toEdit.data.length).to.equal(origLen);
      expect(toEdit.grouped.message.length).to.equal(messageLen);
    });

    it('should mutate the original datum', function() {
      expect(origMessage).to.not.eql(editedMessage);
      expect(message).to.eql(editedMessage);
    });
  });

  describe('generateFillData', function() {
    var thisTd = new TidelineData([new types.SMBG()]);
    var fills = thisTd.grouped.fill;

    it('should be a function', function() {
      assert.isFunction(td.generateFillData);
    });

    it('should extend beyond extent of data on either side', function() {
      expect(fills[0].normalTime).to.be.below(thisTd.grouped.smbg[0].normalTime);
      expect(fills[fills.length - 1].normalTime).to.be.above(thisTd.grouped.smbg[0].normalTime);
    });

    // TODO: for @jhbate
    it.skip('should always cover at least 24 hours, even if there is only one point-in-time datum', function() {

    });

    it('should be contiguous', function() {
      for (var i = 0; i < fills.length; ++i) {
        if (i !== fills.length - 1) {
          expect(fills[i].normalEnd).to.equal(fills[i + 1].normalTime);
        }
      }
    });
  });

  describe('adjustFillsForTwoWeekView', function() {
    it('should be a function', function() {
      assert.isFunction(td.adjustFillsForTwoWeekView);
    });

    it('should cover at least 14 days surrounding where smbg data exists (messages outside)', function() {
      var data = [
        new types.Message({time: '2014-09-01T12:00:00.000Z'}),
        new types.SMBG({deviceTime: '2014-09-05T05:00:00'}),
        new types.SMBG({deviceTime: '2014-09-16T19:00:00'}),
        new types.Message({time: '2014-09-30T12:00:00.000Z'})
      ];
      var thisTd = new TidelineData(data);
      expect(thisTd.twoWeekData[0].normalTime).to.equal('2014-09-03T00:00:00.000Z');
      expect(thisTd.twoWeekData[thisTd.twoWeekData.length - 1].normalTime).to.equal('2014-09-16T21:00:00.000Z');
    });

    it('should cover at least 14 days surrounding where smbg data exists (just smbg)', function() {
      var data = [
        new types.SMBG({deviceTime: '2014-09-13T05:00:00'}),
        new types.SMBG({deviceTime: '2014-09-14T19:00:00'})
      ];
      var thisTd = new TidelineData(data);
      expect(thisTd.twoWeekData[0].normalTime).to.equal('2014-09-01T00:00:00.000Z');
      expect(thisTd.twoWeekData[thisTd.twoWeekData.length - 1].normalTime).to.equal('2014-09-14T21:00:00.000Z');
    });
  });
});