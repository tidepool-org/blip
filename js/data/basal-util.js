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

    var checkNextSegment = function(tempSegment, i, j) {
      var segment = scheduled[i + 1];
      var start = new Date(segment.start).valueOf();
      var end = new Date(segment.end).valueOf();
      var tempEnd = new Date(tempSegment.end).valueOf();
      var nextTemp = temp[j + 1];
      if (nextTemp) {
        var nextTempStart = new Date(nextTemp.start).valueOf();
        var nextTempEnd = new Date(nextTemp.end).valueOf();
      }
      recursedSegments.push(scheduled[i]);
      recursedSegments.push(segment);
      // = basal-temp-both-ends.json
      // one temp basal ends with a particular scheduled segment and another one begins
      // scheduled segment split into three parts
      // then following scheduled segment (possibly recursively) checked for containing the end of the second temp basal
      if ((tempEnd > start) && (tempEnd < end) && (nextTempStart > start)) {
        var firstCouldHaveBeen = _.clone(segment);
        firstCouldHaveBeen.end = tempSegment.end;
        undelivered.push(firstCouldHaveBeen);
        var thisScheduled = _.clone(segment);
        thisScheduled.start = tempSegment.end;
        thisScheduled.end = nextTemp.start;
        actual.push(thisScheduled);
        var secondCouldHaveBeen = _.clone(segment);
        secondCouldHaveBeen.start = nextTemp.start;
        undelivered.push(secondCouldHaveBeen);
        var firstTemp = _.clone(tempSegment);
        firstTemp.start = segment.start;
        actual.push(firstTemp);
        var secondTemp = _.clone(nextTemp);
        secondTemp.end = segment.end;
        actual.push(secondTemp);
        checkNextSegment(nextTemp, i + 1, j);
      }
      else if (tempEnd < end) {
        tempStartAtEndWithin(segment, tempSegment);
      }
      else if (tempEnd > end) {
        allTemp(segment, tempSegment);
        checkNextSegment(tempSegment, i + 1, j);
      }
      else if (tempEnd === end) {
        allTemp(segment, tempSegment);
      }
      return;
    };

    scheduled.forEach(function(segment, i) {
      tempIntervening = false;
      var start = new Date(segment.start).valueOf();
      var end = new Date(segment.end).valueOf();
      temp.forEach(function(tempSegment, j) {
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
          recursedSegments.push(segment);
          return;
        }
        // = basal-temp-start.json
        // exceedingly rare case where temp basal starts at the exact same time as the start of the scheduled segment
        // scheduled gets split into two segments
        else if ((tempStart === start) && (tempEnd < end)) {
          if (recursedSegments.indexOf(segment) !== -1) {
            tempStartAtEndWithin(segment, tempSegment); 
          }
          return;
        }
        // = basal-temp-end.json
        // exceedingly rare case where temp basal ends at the exact same time as the end of the scheduled segment
        // scheduled gets split into two segments
        else if ((tempStart > start) && (tempEnd === end)) {
          if (recursedSegments.indexOf(segment) !== -1) {
            var firstScheduled = _.clone(segment);
            firstScheduled.end = tempSegment.start;
            actual.push(firstScheduled);
            var couldHaveBeen = _.clone(segment);
            couldHaveBeen.start = tempSegment.start;
            undelivered.push(couldHaveBeen);
            actual.push(tempSegment);
          }
          return;
        }
        // = basal-temp-two-scheduled.json
        // = basal-temp-many-scheduled.json
        // temp basal starts but does not end within a scheduled segment
        // scheduled segment gets split into two segments
        // following scheduled segment are (possibly recursively) checked for containing the end of the temp basal
        else if ((tempStart > start) && (tempStart < end)) {
          if (recursedSegments.indexOf(segment) !== -1) {
            var firstScheduled = _.clone(segment);
            firstScheduled.end = tempSegment.start;
            actual.push(firstScheduled);
            var couldHaveBeen = _.clone(segment);
            couldHaveBeen.start = tempSegment.start;
            undelivered.push(couldHaveBeen);
            beginningOfTemp = _.clone(tempSegment);
            beginningOfTemp.end = segment.end;
            actual.push(beginningOfTemp);
            checkNextSegment(tempSegment, i, j);
          }
          return;
        }
      });
      if (recursedSegments.indexOf(segment) == -1) {
        actual.push(segment);
      }
    });

    actual = _.sortBy(actual, function(a) {
      return new Date(a.start).valueOf();
    });
    undelivered = _.sortBy(undelivered, function(u) {
      return new Date(u.start).valueOf();
    });

    var nonContinuous = [];

    actual.forEach(function(segment, i) {
      if (actual[i + 1])
      {      
        if (!(segment.end === actual[i + 1].start)) {
          nonContinuous.push([segment, actual[i + 1]]);
          return;
        }
      }
    });

    return {
      "actualSegments": actual,
      "undeliveredSegments": undelivered,
      "scheduledSegments": scheduled,
      "tempSegments": temp,
      "nonContinuousSegments": nonContinuous
    };
  }  

  return basal;
};