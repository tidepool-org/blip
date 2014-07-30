/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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
var moment = require('moment');

var dt = require('./datetime');
var types = require('./types');

var day = {
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
  MS_IN_24: 86400000,
  addInterval: dt.addInterval,
  START: moment('2008-01-01T00:00:00.000Z')
};

var CBGDay = function(opts) {
  var defaults = {
    interval: 5,
    patterns: {
      steady: function(value) {
        return value || 100;
      }
    },
    spread: {
      min: 39,
      max: 401,
      jump: 4
    }
  };

  this.opts = opts || {};

  this.opts = _.defaults(this.opts, defaults);

  this.maxDatapoints = (this.HOURS_PER_DAY * this.MINUTES_PER_HOUR)/this.opts.interval;

  this.generateFull = function(pattern, opts) {
    opts = opts || {};
    var datetime = opts.start || this.START, count = 0, events = [];
    while (count <= this.maxDatapoints) {
      events.push(new types.CBG(datetime.utc().format().slice(0,-6), pattern(opts.seedValue)));
      datetime = this.addInterval(datetime, {'minutes': this.opts.interval});
      count += 1;
    }

    for (var i = 0; i < events.length; ++i) {
      events[i] = events[i].asObject();
    }
    return events;
  };
};

CBGDay.prototype = day;

var SMBGDay = function(opts) {
  var defaults = {
    interval: 180,
    patterns: {
      ident: function(value) {
        return value || 100;
      }
    },
    spread: {
      min: 20,
      max: 600,
      jump: 25
    }
  };

  this.opts = opts || {};

  this.opts = _.defaults(this.opts, defaults);

  this.generateFull = function(pattern, opts) {
    opts = opts || {};
    var datetime = opts.start || this.START, count = 0, events = [];
    var values = [this.opts.spread.min, 79, 80, 180, 181, this.opts.spread.max];
    if (opts.reverse) {
      values.reverse();
    }
    while (count < values.length) {
      events.push(new types.SMBG(datetime.utc().format().slice(0, -6), pattern(values[count])));
      datetime = this.addInterval(datetime, {'minutes': this.opts.interval});
      count += 1;
    }

    for (var i = 0; i < events.length; ++i) {
      events[i] = events[i].asObject();
    }
    return events;
  };
};

SMBGDay.prototype = day;

var CarbsDay = function(opts) {
  var defaults = {
    interval: 90,
    patterns: {
      alternating: function(value) {
        var big = true;
        return function() {
          var toReturn = big ? value : 10;
          if (big) {
            big = false;
          }
          else {
            big = true;
          }
          return toReturn;
        };
      }
    },
    spread: {
      min: 5,
      max: 150,
      jump: 25
    }
  };

  this.opts = opts || {};

  this.opts = _.defaults(this.opts, defaults);

  this.maxDatapoints = (this.HOURS_PER_DAY * this.MINUTES_PER_HOUR)/this.opts.interval;

  this.generateFull = function(pattern, opts) {
    opts = opts || {};
    var datetime = opts.start || this.START, count = 0, events = [];

    while (count < this.maxDatapoints) {
      events.push(new types.Carbs(datetime.utc().format().slice(0, -6), pattern()));
      datetime = this.addInterval(datetime, {'minutes': this.opts.interval});
      count += 1;
    }

    for (var i = 0; i < events.length; ++i) {
      events[i] = events[i].asObject();
    }
    return events;
  };
};

CarbsDay.prototype = day;

var BolusDay = function(opts) {
  var defaults = {
    interval: 60,
    patterns: {
      allFeatureSets: function() {
        var values = [2,4.5,6,7.5,9.25,10], i = 0;
        var featureSets = new types.Bolus().getAllFeatureSetNames();
        return function() {
          // reset i
          if (i === values.length) {
            i = 0;
          }
          return {
            value: values[i],
            featureSet: featureSets[i++]
          };
        };
      }
    },
    spread: {
      min: 5,
      max: 20,
      jump: 0.8
    }
  };

  this.opts = opts || {};

  this.opts = _.defaults(this.opts, defaults);

  this.maxDatapoints = (this.HOURS_PER_DAY * this.MINUTES_PER_HOUR)/this.opts.interval;

  this.generateFull = function(pattern, opts) {
    opts = opts || {};
    var datetime = opts.start || this.START, count = 0, events = [];

    while (count < this.maxDatapoints) {
      events.push(new types.Bolus(datetime.utc().format().slice(0, -6), pattern()));
      datetime = this.addInterval(datetime, {'minutes': this.opts.interval});
      count += 1;
    }

    for (var i = 0; i < events.length; ++i) {
      events[i] = events[i].asObject();
    }
    return events;
  };
};

BolusDay.prototype = day;

var WizardDay = function(opts) {
  var defaults = {
    interval: 60,
    patterns: {
      alternating: function() {
        var big = true;
        return function(value) {
          var toReturn = big ? value : 10;
          if (big) {
            big = false;
          }
          else {
            big = true;
          }
          return toReturn;
        };
      },
      carbRatio: function() {
        var ratio = 10;
        return function(value) {
          return (value * ratio).toFixed(0);
        };
      }
    },
    spread: {
      min: 5,
      max: 150,
      jump: 25
    }
  };

  this.opts = opts || {};

  this.opts = _.defaults(this.opts, defaults);

  this.generateFull = function(pattern, opts) {
    opts = opts || {};
    var count = 0, events = [];

    while (count < opts.boluses.length) {
      events.push(new types.Wizard(opts.boluses[count].deviceTime, {
        featureSet: 'default',
        joinKey: opts.boluses[count].joinKey,
        value: pattern(opts.boluses[count].value)
      }));
      count += 1;
    }

    for (var i = 0; i < events.length; ++i) {
      events[i] = events[i].asObject();
    }
    return events;
  };
};

WizardDay.prototype = day;

var BasalDay = function(opts) {
  var interval = 30;
  var defaults = {
    interval: interval,
    patterns: {
      allFeatureSets: function() {
        var i = 0;
        var featureSets = new types.Basal().getAllFeatureSetNames();
        return function(incrementer) {
          // reset i
          if (i === featureSets.length) {
            i = 0;
          }
          return {
            incrementer: incrementer,
            featureSet: featureSets[i++]
          };
        };
      }
    }
  };

  this.opts = opts || {};

  this.opts = _.defaults(this.opts, defaults);

  this.generateFull = function(pattern, opts) {
    opts = opts || {};
    var datetime = opts.start || this.START, totalDuration = 0, events = [];

    while (totalDuration < this.MS_IN_24) {
      var newBasal = new types.Basal(datetime.utc().format().slice(0, -6), pattern(opts.incrementer));
      events.push(newBasal);
      datetime = this.addInterval(datetime, {'milliseconds': newBasal.duration});
      totalDuration += newBasal.duration;
    }

    for (var i = 0; i < events.length; ++i) {
      events[i] = events[i].asObject();
    }
    return events;
  };
};

BasalDay.prototype = day;

module.exports = (function() {
  return {
    CBGDay: CBGDay,
    SMBGDay: SMBGDay,
    CarbsDay: CarbsDay,
    BolusDay: BolusDay,
    WizardDay: WizardDay,
    BasalDay: BasalDay
  };
}());