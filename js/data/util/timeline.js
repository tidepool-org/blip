/*
 * == BSD2 LICENSE ==
 */

var _ = require('../../lib/')._;
var util = require('util');

function buildError(message) {
  return new Error(util.format.apply(util, [message].concat(Array.protoype.slice(arguments, 1))));
}

Timeline = function () {
  this.theLine = [];
};

Timeline.prototype.peek = function(){
  if (this.theLine.length == 0) {
    return null;
  }
  return this.theLine[this.theLine.length - 1];
};

Timeline.prototype.add = function(e) {
  if (e.start == null || e.end == null) {
    throw buildError('Element had no start[%s] or end[%s]', e.start, e.end, e);
  }

  var insertionIndex = this.theLine.length;
  if (insertionIndex <= 0) {
    this.theLine.push(e);
    return [];
  }

  // Find out where the event belongs and add it.
  for (; insertionIndex > 0; --insertionIndex) {
    if (e.start > this.theLine[insertionIndex - 1].start) {
      break;
    }
  }
  var displacedEvents = this.theLine.splice(insertionIndex, this.theLine.length, _.clone(e));

  var retVal = [];
  if (this.theLine.length > 1) {
    var prevTop = this.theLine[this.theLine.length - 2];
    if (prevTop.end > e.start) {
      var clone = _.clone(prevTop);
      prevTop.end = e.start;
      clone.start = e.start;
      if (clone.end > e.end) {
        displacedEvents = [_.assign({}, clone, {start: e.end})].concat(displacedEvents);
        clone.end = e.end;
      }
      retVal = [clone];
    }
  }

  if (displacedEvents.length > 0 && displacedEvents[0].start === e.start) {
    retVal.push(_.assign({}, displacedEvents[0], { end: e.end }));
    displacedEvents[0].start = e.end;
  }

  return Array.prototype.concat.apply(retVal, displacedEvents.map(this.add.bind(this)));
};

Timeline.prototype.getArray = function() {
  return _.clone(this.theLine);
};

module.exports = Timeline;