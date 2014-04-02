/*
 * == BSD2 LICENSE ==
 */

var _ = require('../../lib/')._;
var util = require('util');

function buildError(message) {
  return new Error(util.format.apply(util, [message].concat(Array.prototype.slice.call(arguments, 1))));
}

/**
 * A Timeline is an object that maintains a sorted list of events in a "timeline"
 *
 * Events must have `start` and `end` properties that are sortable with standard mathematical sort (<, >, =).
 * When `add()`ed the data structure will find the "right" location for the event based on its start and
 * will then re-apply the other events.  If there is any overlap between events, then the chunk of the
 * overlapped event that is currently in the timeline is removed.
 *
 * This object can optionally "smoosh" events together that occur next to each other.  This is done by providing
 * a smooshingPred function to the constructor.  If this is provided, then two events will be "smooshed" if they
 * abut and the predicate returns true.  When smooshed, the "left" object (earlier object) is maintained and
 * its "end" parameter is set to the end of the "right" object.
 *
 * @param smooshingPred The predicate for if two messages should be smooshed
 * @constructor
 */
Timeline = function (smooshingPred) {
  this.theLine = [];

  if (smooshingPred == null) {
    this.smooshingPred = function () { return false; };
  } else {
    this.smooshingPred = smooshingPred;
  }
};

Timeline.prototype.peek = function(){
  if (this.theLine.length == 0) {
    return null;
  }
  return this.theLine[this.theLine.length - 1];
};

Timeline.prototype.pop = function(){
  return this.theLine.pop();
};

Timeline.prototype.add = function(e) {
  if (e.start == null || e.end == null) {
    throw buildError('Element had no start[%s] or end[%s]', e.start, e.end, e);
  }

  if (e.start > e.end) {
    throw buildError('start[%s] > end[%s], wtf??', e.start, e.end, e);
  }

  var insertionIndex = this.theLine.length;
  if (insertionIndex <= 0) {
    this.theLine.push(e);
    return [];
  }

  // Find out where the event belongs and add it.
  for (; insertionIndex > 0; --insertionIndex) {
    var currEle = this.theLine[insertionIndex - 1];
    if (e.start === currEle.end || e.start > currEle.start) {
      break;
    }
  }
  var displacedEvents = this.theLine.splice(insertionIndex, this.theLine.length, _.clone(e));

  var retVal = [];
  if (this.theLine.length > 1) {
    var prevTop = this.theLine[this.theLine.length - 2];
    if (prevTop.end > e.start) {
      // e overlaps the previous top, so we have to chunk things up
      var clone = _.clone(prevTop);
      prevTop.end = e.start;
      clone.start = e.start;
      if (clone.end > e.end) {
        displacedEvents = [_.assign({}, clone, {start: e.end})].concat(displacedEvents);
        clone.end = e.end;
      }
      retVal = [clone];
    }

    if (prevTop.end === e.start) {
      // Maybe smoosh
      if (this.smooshingPred(prevTop, e)) {
        prevTop.end = this.theLine.pop().end;
      }
    }
  }

  if (displacedEvents.length > 0) {
    var firstDisplaced = displacedEvents[0];
    if (firstDisplaced.start === e.start) {
      // The displaced event starts at the same time as our event and completely covers our event,
      // which means the current event should splot itself over the displaced event.

      var endPoint = e.end;
      if (endPoint > firstDisplaced.end) {
        endPoint = firstDisplaced.end;
      }
      retVal.push(_.assign({}, firstDisplaced, { end: endPoint }));
      firstDisplaced.start = endPoint;

      if (firstDisplaced.start == firstDisplaced.end) {
        displacedEvents.shift(); // Remove the element
      }
    }
  }

  return Array.prototype.concat.apply(retVal, displacedEvents.map(this.add.bind(this)));
};

Timeline.prototype.getArray = function() {
  return _.clone(this.theLine);
};

module.exports = Timeline;