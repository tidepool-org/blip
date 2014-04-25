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

var format = require('../../data/util/format');

var definitions = {
  LEAD_TEXT: {
    'stats-insufficient-data': function() {
      return 'Why is this grey?';
    }
  },
  MAIN_TEXT: {
    'carelink/basal/temp-percent-create-scheduled': function(source, defs) {
      // We are calculating the temp basal rates here by applying the 
      // percentage of the temp basal to your current schedule, but
      // Carelink did not directly provide us with these rate changes.
      var a = "We are calculating the temp basal rates here by applying the percentage of the temp basal to your current schedule, but ";
      var b = " did not directly provide us with these rate changes.";
      return defs.stitch(a, b, source);
    },
    'carelink/basal/off-schedule-rate': function(source, defs) {
      // You may have changed pumps recently - perhaps because you
      // had to have your pump replaced due to malfuction. As a result of how
      // Carelink report the data, we can't be 100% certain of your basal rate here.
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your basal rate here.";
      return defs.stitch(a, b, source);
    },
    'carelink/settings/basal-mismatch': function(source, defs) {
      // You may have changed pumps recently - perhaps because you
      // had to have your pump replaced due to malfuction. As a result of how 
      // Carelink reports the data, we can't be 100% certain of your basal settings here.
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your basal settings here.";
      return defs.stitch(a, b, source);
    },
    'carelink/settings/wizard-mismatch': function(source, defs) {
      // You may have changed pumps recently - perhaps because you had to have
      // your pump replaced due to malfuction. As a result of how Carelink
      // reports the data, we can't be 100% certain of your bolus wizard settings here.
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your bolus wizard settings here.";
      return defs.stitch(a, b, source);
    },
    'carelink/settings/activeSchedule-mismatch': function(source, defs) {
      // You may have changed pumps recently - perhaps because you had to have
      // your pump replaced due to malfuction. As a result of how Carelink
      // reports the data, we can't be 100% certain of your active basal pattern here.
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your active basal pattern here.";
      return defs.stitch(a, b, source);
    },
    'diasend/basal/temp-basal-fabrication': function(source, defs) {
      // The Diasend .xls file doesn't report temp basals directly, so we have to infer from
      // other evidence where you might have been using a temp basal rate. We
      // think this segment could be a temp basal, but it may not be.
      var a = "The ";
      var b = " .xls file doesn't report temp basals directly, so we have to infer from other evidence where you might have been using a temp basal rate. We think this segment could be a temp basal, but it may not be.";
      return defs.stitch(a, b, source);
    },
    'diasend/basal/temp-duration-truncated': function(source, defs) {
      // Because of how the Diasend .xls file reports the data, we've truncated what
      // may have beena temp basal here to a maximum duration of 120 hours.
      var a = "Because of how the ";
      var b = " .xls file reports the data, we've truncated what may have been a temp basal here to a maximum duration of 120 hours.";
      return defs.stitch(a, b, source);
    },
    'diasend/bolus/extended': function(source, defs) {
      // The Diasend .xls file doesn't report the split between the intitial
      // and the extended delivery during a combo bolus. All we can display is the
      // duration of the combo bolus and the total dose delivered.
      var a = "The ";
      var b = " .xls file doesn't report the split between the intitial and the extended delivery during a combo bolus. All we can display is the duration of the combo bolus and the total dose delivered.";
      return defs.stitch(a, b, source);
    },
    'stats-insufficient-data': function() {
      return 'There is not enough data to show this statistic.';
    }
  },
  default: function(source) {
    if (source == null) {
      return "We can't be 100% certain of the data displayed here.";
    }
    var a = "We can't be 100% certain of the data displayed here because of how ";
    var b = " reports the data.";
    return this.stitch(a, b, source);
  },
  main: function(annotation, source) {
    var a, b;
    if (this.MAIN_TEXT[annotation.code] != null) {
      return this.MAIN_TEXT[annotation.code](source, this);
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