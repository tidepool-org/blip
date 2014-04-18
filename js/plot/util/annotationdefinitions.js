/* 
 * == BSD2 LICENSE ==
 */

var format = require('../../data/util/format');

var definitions = {
  LEAD_TEXT: {
    'stats': function() {
      return 'Why is this grey?';
    }
  },
  MAIN_TEXT: {
    'basal/off-schedule-rate': function(source) {
      return definitions.default(source);
    },
    'generated-from-wizard': function(source) {
      return definitions.default(source);
    },
    'settings-mismatch/basal': function(source) {
      return definitions.default(source);
    },
    'settings-mismatch/activeSchedule': function(source) {
      return definitions.default(source);
    },
    'settings-mismatch/wizard': function(source) {
      return definitions.default(source);
    },
    'diasend/extended-boluses': function(source) {
      return definitions.default(source);
    },
    'diasend/temp-basal-fabrication': function(source) {
      return definitions.default(source);
    },
    'diasend/temp-limit-24hrs': function(source) {
      return definitions.default(source);
    },
    'stats': function() {
      return 'There is not enough data to show this statistic.';
    }
  },
  default: function(source) {
    if (source == null) {
      return "We can't be 100% certain of the data displayed here."
    }
    var a = "We can't be 100% certain of the data displayed here because of how ";
    var b = " reports the data.";
    return  this.stitch(a, b, source);
  },
  main: function(annotation, source) {
    var a, b;
    if (this.MAIN_TEXT[annotation.code] != null) {
      return this.MAIN_TEXT[annotation.code](source);
    }
    else {
      return this.default(source);
    }
  },
  stitch: function(a, b, source) {
    return a + format.capitalize(source) + b;
  },
  lead: function(code) {
    code = code || '';
    if (this.LEAD_TEXT[code] != null) {
      return this.LEAD_TEXT[code]();
    }
    else {
      return false;
    }
  }
};

module.exports = definitions;