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

// You can view the full text of each annotation by running mocha test/annotations_test.js
// Current output:
//
// Main text annotation for carelink/basal/temp-percent-create-scheduled:
// We are calculating the temp basal rates here by applying the percentage of the temp basal to your current schedule, but Demo did not directly provide us with these rate changes.
//
// Main text annotation for carelink/basal/off-schedule-rate:
// You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how Demo reports the data, we can't be 100% certain of your basal rate here.
//
// Main text annotation for carelink/settings/basal-mismatch:
// You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how Demo reports the data, we can't be 100% certain of your basal settings here.
//
// Main text annotation for carelink/settings/wizard-mismatch:
// You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how Demo reports the data, we can't be 100% certain of your bolus wizard settings here.
//
// Main text annotation for carelink/settings/activeSchedule-mismatch:
// You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how Demo reports the data, we can't be 100% certain of your active basal pattern here.
//
// Main text annotation for carelink/device-overlap-boundary:
// We are not showing data here because we've received datasets from multiple pumps that are in conflict. Demo did not provide enough information to distinguish the data from each pump.
//
// Main text annotation for diasend/basal/temp-basal-fabrication:
// The Demo .xls file doesn't report temp basals directly, so we have to infer from other evidence where you might have been using a temp basal rate. We think this segment could be a temp basal, but it may not be.
//
// Main text annotation for diasend/basal/temp-duration-truncated:
// Because of how the Demo .xls file reports the data, we've truncated what may have been a temp basal here to a maximum duration of 120 hours.
//
// Main text annotation for diasend/bolus/extended:
// The Demo .xls file doesn't report the split between the intitial and the extended delivery during a combo bolus. All we can display is the duration of the combo bolus and the total dose delivered.
//
// Main text annotation for basal/intersects-incomplete-suspend
// Within this basal segment, we are omitting a suspend event that didn't end. This may have resulted from switching to a new device. As a result, this basal segment may be inaccurate.
//
// Main text annotation for stats-insufficient-data:
// There is not enough data to show this statistic.
//
// Lead text annotation for stats-insufficient-data:
// Why is this grey? 

var format = require('../../../data/util/format');

var definitions = {
  LEAD_TEXT: {
    'stats-insufficient-data': function() {
      return 'Why is this grey?';
    }
  },
  MAIN_TEXT: {
    'carelink/basal/temp-percent-create-scheduled': function(source, defs) {
      var a = "We are calculating the temp basal rates here by applying the percentage of the temp basal to your current schedule, but ";
      var b = " did not directly provide us with these rate changes.";
      return defs.stitch(a, b, source);
    },
    'carelink/basal/off-schedule-rate': function(source, defs) {
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your basal rate here.";
      return defs.stitch(a, b, source);
    },
    'carelink/settings/basal-mismatch': function(source, defs) {
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your basal settings here.";
      return defs.stitch(a, b, source);
    },
    'carelink/settings/wizard-mismatch': function(source, defs) {
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your bolus wizard settings here.";
      return defs.stitch(a, b, source);
    },
    'carelink/settings/activeSchedule-mismatch': function(source, defs) {
      var a = "You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ";
      var b = " reports the data, we can't be 100% certain of your active basal pattern here.";
      return defs.stitch(a, b, source);
    },
    'carelink/device-overlap-boundary': function(source, defs) {
      var a = "We are not showing data here because we've received datasets from multiple pumps that are in conflict.";
      var b = " did not provide enough information to distinguish the data from each pump.";
      return defs.stitch(a, b, source);
    },
    'diasend/basal/temp-basal-fabrication': function(source, defs) {
      var a = "The ";
      var b = " .xls file doesn't report temp basals directly, so we have to infer from other evidence where you might have been using a temp basal rate. We think this segment could be a temp basal, but it may not be.";
      return defs.stitch(a, b, source);
    },
    'diasend/basal/temp-duration-truncated': function(source, defs) {
      var a = "Because of how the ";
      var b = " .xls file reports the data, we've truncated what may have been a temp basal here to a maximum duration of 120 hours.";
      return defs.stitch(a, b, source);
    },
    'diasend/bolus/extended': function(source, defs) {
      var a = "The ";
      var b = " .xls file doesn't report the split between the intitial and the extended delivery during a combo bolus. All we can display is the duration of the combo bolus and the total dose delivered.";
      return defs.stitch(a, b, source);
    },
    'basal/intersects-incomplete-susppend': function() {
      return "Within this basal segment, we are omitting a suspend event that didn't end. This may have resulted from switching to a new device. As a result, this basal segment may be inaccurate.";
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
    var sourceText = source === 'carelink' ? ' CareLink' : format.capitalize(source);
    return a + sourceText + b;
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