var _ = require('underscore');

module.exports = function() {

  function basal(data) {
    // produce non-overlapping viz-ready segments
    var actual = [];
    var undelivered = [];
    
    var temp = _.where(data, {'deliveryType': 'temp'});
    var scheduled = _.where(data, {'deliveryType': 'scheduled'});
    // ensure both collections are properly sorted
    temp = _.sortBy(temp, function(t) {
      return new Date(t.start).valueOf();
    });
    scheduled = _.sortBy(scheduled, function(s) {
      return new Date(s.start).valueOf();
    });

    var recursedSegments = [];

    var tempStartAtEndWithin = function(segment, tempSegment) {
      var endOfTemp = _.clone(tempSegment);
      endOfTemp.start = segment.start;
      actual.push(endOfTemp);
      var couldHaveBeen = _.clone(segment);
      couldHaveBeen.end = tempSegment.end;
      undelivered.push(couldHaveBeen);
      var secondScheduled = _.clone(segment);
      secondScheduled.start = tempSegment.end;
      actual.push(secondScheduled);
      return;
    };

    var allTemp = function(segment, tempSegment) {
      var thisTemp = _.clone(tempSegment);
      thisTemp.end = segment.end;
      thisTemp.start = segment.start;
      actual.push(thisTemp);
      undelivered.push(segment);
      return;
    };

    var checkNextSegment = function(tempSegment, i) {
      var segment = scheduled[i + 1];
      recursedSegments.push(segment);
      var end = new Date(segment.end).valueOf();
      var tempEnd = new Date(tempSegment.end).valueOf();
      recursed = true;
      if (tempEnd < end) {
        tempStartAtEndWithin(segment, tempSegment);
      }
      else if (tempEnd > end) {
        allTemp(segment, tempSegment);
        checkNextSegment(tempSegment, i + 1);
      }
      else if (tempEnd === end) {
        allTemp(segment, tempSegment);
      }
      return;
    };

    var tempIntervening = false;

    scheduled.forEach(function(segment, i) {
      var start = new Date(segment.start).valueOf();
      var end = new Date(segment.end).valueOf();
      temp.forEach(function(tempSegment) {
        var tempStart = new Date(tempSegment.start).valueOf();
        var tempEnd = new Date(tempSegment.end).valueOf();
        // = basal-contained.json
        // temp basal starts and ends within a scheduled segment
        // scheduled gets split into three segments
        if ((tempStart > start) && (tempEnd < end)) {
          actual.push(tempSegment);
          var firstScheduled = _.clone(segment);
          firstScheduled.end = tempSegment.start;
          actual.push(firstScheduled);
          var couldHaveBeen = _.clone(segment);
          couldHaveBeen.start = tempSegment.start;
          couldHaveBeen.end = tempSegment.end;
          undelivered.push(couldHaveBeen);
          var secondScheduled = _.clone(segment);
          secondScheduled.start = tempSegment.end;
          actual.push(secondScheduled);
          tempIntervening = true;
          return;
        }
        // = basal-temp-start.json
        // exceedingly rare case where temp basal starts at the exact same time as the start of the scheduled segment
        // scheduled gets split into two segments
        else if ((tempStart === start) && (tempEnd < end)) {
          tempStartAtEndWithin(segment, tempSegment);
          tempIntervening = true;
          return;
        }
        // = basal-temp-end.json
        // exceedingly rare case where temp basal ends at the exact same time as the end of the scheduled segment
        // scheduled gets split into two segments
        else if ((tempStart > start) && (tempEnd === end)) {
          var firstScheduled = _.clone(segment);
          firstScheduled.end = tempSegment.start;
          actual.push(firstScheduled);
          var couldHaveBeen = _.clone(segment);
          couldHaveBeen.start = tempSegment.start;
          undelivered.push(couldHaveBeen);
          actual.push(tempSegment);
          tempIntervening = true;
          return;
        }
        // = basal-temp-two-scheduled.json
        // = basal-temp-many-scheduled.json
        // temp basal starts but does not end within a scheduled segment
        // scheduled segment gets split into two segments
        // following scheduled segment are (possibly recursively) checked for containing the end of the temp basal
        else if ((tempStart > start) && (tempStart < end)) {
          var firstScheduled = _.clone(segment);
          firstScheduled.end = tempSegment.start;
          actual.push(firstScheduled);
          var couldHaveBeen = _.clone(segment);
          couldHaveBeen.start = tempSegment.start;
          undelivered.push(couldHaveBeen);
          beginningOfTemp = _.clone(tempSegment);
          beginningOfTemp.end = segment.end;
          actual.push(beginningOfTemp);
          checkNextSegment(tempSegment, i);
          tempIntervening = true;
          return;
        }
        // = basal-template.json
        else {
          tempIntervening = false;
        }
      });
      if ((!tempIntervening) && (recursedSegments.indexOf(segment) == -1)) {
        actual.push(segment);
      }
    });

    actual = _.sortBy(actual, function(a) {
      return new Date(a.start).valueOf();
    });
    undelivered = _.sortBy(undelivered, function(u) {
      return new Date(u.start).valueOf();
    });

    return {"actual": actual, "undelivered": undelivered};
  }  

  return basal;
};