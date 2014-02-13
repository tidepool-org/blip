var _ = require('underscore');

try {
  var log = require('bows')('BasalUtil');
}
catch(ReferenceError) {
  console.log('Not using bows.');
}

function BasalUtil(data) {
  this.actual = [];
  this.undelivered = [];

  var sliceCurrent = function(current, next, pushLocation) {
    var earliest = _.min([current.end, next], function(d) {
      return new Date(d).valueOf();
    });
    if (earliest === current.end) {
      pushLocation.push(current);
    }
    else {
      current.end = next;
      pushLocation.push(current);
    }
  };

  var temp = _.where(data, {'deliveryType': 'temp'});
  var scheduled = _.where(data, {'deliveryType': 'scheduled'});

  // ensure both collections are properly sorted
  temp = _.sortBy(temp, function(t) {
    return new Date(t.start).valueOf();
  });
  scheduled = _.sortBy(scheduled, function(s) {
    return new Date(s.start).valueOf();
  });

  // create an ordered list of the unique start datetimes in all basal segments
  var datetimes = [];

  temp.forEach(function(i) {
    datetimes.push(i.start);
    datetimes.push(i.end);
  });
  scheduled.forEach(function(i) {
    datetimes.push(i.start);
    datetimes.push(i.end);
  });

  datetimes = _.sortBy(_.uniq(datetimes), function(i) {
    return new Date(i).valueOf();
  });

  var actualSegments = [];

  datetimes.forEach(function(dt, i) {
    if (i < datetimes.length - 1) {
      actualSegments.push({
        'start': dt,
        'end': datetimes[i + 1]
      });
    }
  });

  actualSegments.forEach(function(actSegment) {
    var matching;
    try {
      matching = _.filter(data, function(segment){
        var start = new Date(segment.start).valueOf();
        var end = new Date(segment.end).valueOf();
        var actStart = new Date(actSegment.start).valueOf();
        var actEnd = new Date(actSegment.end).valueOf();
        return ((start === actStart) && (end === actEnd) ||
          (start === actStart) ||
          (end === actEnd) ||
          (start < actStart) && (end > actEnd));
      });
      if (matching.length > 2) {
        throw "OverlappingTempBasals";
      }
    }
    catch(OverlappingTempBasals) {
      if(!log) {
        console.log('Possible overlapping temp basals!');
      }
      else {
        log('Possible overlapping temp basals!');
      }
    }

    var temp = _.find(matching, function(m) {
      return m.deliveryType === 'temp';
    });
    if (temp) {
      var tempMatch = _.clone(temp);
      tempMatch.start = actSegment.start;
      tempMatch.end = actSegment.end;
      this.actual.push(tempMatch);
    }
    else {
      var match = _.clone(matching[0]);
      match.start = actSegment.start;
      match.end = actSegment.end;
      this.actual.push(match);
    }
  }, this);

  var temps = _.where(this.actual, {'deliveryType': 'temp'});

  temps.forEach(function(temp, i, temps) {
    var matching = _.filter(scheduled, function(d) {
      var start = new Date(d.start).valueOf();
      var end = new Date(d.end).valueOf();
      var tempStart = new Date(temp.start).valueOf();
      var tempEnd = new Date(temp.end).valueOf();
      return ((start === tempStart) && (end === tempEnd) ||
        (start === tempStart) ||
        (end === tempEnd) ||
        (start < tempStart) && (end > tempEnd));
    });
    matching.forEach(function(m) {
      var match = _.clone(m);
      match.start = temp.start;
      match.end = temp.end;
      this.undelivered.push(match);
    }, this);
  }, this);

  // re-sort the results!
  this.actual = _.sortBy(this.actual, function(segment) {
    return new Date(segment.start).valueOf();
  });

  this.undelivered = _.sortBy(this.undelivered, function(segment) {
    return new Date(segment.start).valueOf();
  });

  // add vizType = 'actual' or 'undelivered'
  this.actual.forEach(function(segment) {
    segment.vizType = 'actual';
  });
  this.undelivered.forEach(function(segment) {
    segment.vizType = 'undelivered';
  });

  this.getCurrentSegments = function(s, e) {

  };

  this.getTotalDose = function(s, e) {

  };
}

module.exports = BasalUtil;