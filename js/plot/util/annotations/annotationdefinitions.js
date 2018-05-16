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

var format = require('../../../data/util/format');

var definitions = {
  DISABLED: [
    'basal/auto',
    'medtronic600/smbg/bg-reading-received',
    'medtronic600/smbg/user-accepted-remote-bg',
    'medtronic600/smbg/user-rejected-remote-bg',
    'medtronic600/smbg/remote-bg-acceptance-screen-timeout',
    'medtronic600/smbg/bg-si-pass-result-recd-frm-gst',
    'medtronic600/smbg/bg-si-fail-result-recd-frm-gst',
    'medtronic600/smbg/bg-sent-for-calib',
    'medtronic600/smbg/user-rejected-sensor-calib',
    'medtronic600/smbg/entered-in-bg-entry',
    'medtronic600/smbg/entered-in-meal-wizard',
    'medtronic600/smbg/entered-in-bolus-wizard',
    'medtronic600/smbg/entered-in-sensor-calib',
    'medtronic600/smbg/entered-as-bg-marker',
  ],
  LEAD_TEXT: {
    'stats-insufficient-data': function() {
      return 'Why is this grey?';
    },
    'stats-how-calculated': function() {
      return 'What is this?';
    }
  },
  MAIN_TEXT: {
    'bg/out-of-range': function(source, defs) {
      var a = 'This BG value was above or below ';
      var b = '\'s threshold for reporting a numerical value. Your actual BG value was higher or lower than displayed.';
      return defs.stitch(a, b, source);
    },
    'animas/bolus/extended-equal-split': function(source, defs) {
      var a = '';
      var b = ' pumps don\'t capture the details of how combo boluses are split between the normal and extended amounts.';
      return defs.stitch(a, b, source);
    },
    'animas/out-of-sequence': function(source, defs) {
      var a = 'If the data here overlaps, it\'s because the date/time was changed and ';
      var b = ' pumps don\'t capture when this happened.';
      return defs.stitch(a, b, source);
    },
    'animas/basal/flat-rate': function(source, defs) {
      return 'This basal rate was running for longer than 5 days, which we cannot display.';
    },
    'animas/bolus/unknown-duration': function(source, defs) {
      var a = 'We know this bolus was canceled, but ';
      var b = ' pumps do not capture exactly when.';
      return defs.stitch(a, b, source);
    },
    'animas/basal/marked-suspended-from-alarm': function(source, defs) {
      return 'This suspend happened because of one of the following alarms - no power, occlusion, auto-off, or no insulin.';
    },
    'carelink/basal/fabricated-from-schedule': function(source, defs) {
      var a = 'We are calculating the basal rates here using the active basal schedule in your pump settings (and applying the percentage of an active temp basal where applicable), but ';
      var b = ' did not directly provide us with these rate changes.';
      return defs.stitch(a, b, source);
    },
    'carelink/basal/fabricated-from-suppressed': function(source, defs) {
      var a = 'We are deriving the basal rate to display here assuming that your pump resumed to the basal that was active before the pump was suspended, but ';
      var b = ' did not directly provide us with this rate change.';
      return defs.stitch(a, b, source);
    },
    'carelink/basal/off-schedule-rate': function(source, defs) {
      var a = 'You may have changed pumps recently - perhaps because you had to have your pump replaced due to malfuction. As a result of how ';
      var b = ' reports the data, we can\'t be 100% certain of your basal rate here.';
      return defs.stitch(a, b, source);
    },
    'carelink/bolus/missing-square-component': function(source, defs) {
      var a = 'Because of how ';
      var b = ' reports bolus data, normal and square-wave boluses may not be properly combined to appear as a dual-wave bolus.';
      return defs.stitch(a, b, source);
    },
    'carelink/wizard/long-search': function(source, defs) {
      var a = 'Because of how ';
      var b = ' reports bolus and wizard data, we can\'t be 100% certain that the bolus wizard information here (e.g., carbs, suggested dose) corresponds with the bolus.';
      return defs.stitch(a, b, source);
    },
    'insulet/basal/fabricated-from-schedule': function(source, defs) {
      var a = 'We are estimating the duration of the basal rate here using the basal schedule active at download, but ';
      var b = ' did not directly provide us with this information.';
      return defs.stitch(a, b, source);
    },
    'insulet/bolus/split-extended': function(source, defs) {
      var a = 'Because ';
      var b = ' represents extended boluses that cross midnight as two boluses, this bolus could be part of a dual-wave bolus, not an independent square-wave bolus as represented here.';
      return defs.stitch(a, b, source);
    },
    'medtronic/basal/fabricated-from-schedule': function(source, defs) {
      var a = 'We are calculating the basal rates here using the active basal schedule in your pump settings (and applying the percentage of an active temp basal where applicable), but ';
      var b = ' did not directly provide us with these rate changes.';
      return defs.stitch(a, b, source);
    },
    'medtronic/basal/time-change': function(source, defs) {
      return 'Because there was a time change during this basal, we split the basal into two segments.';
    },
    'medtronic/basal/one-second-gap': function(source, defs) {
      var a = 'This basal was extended by one second because the duration and time reported by ';
      var b = ' do not match up exactly.';
      return defs.stitch(a, b, source);
    },
    'medtronic600/basal/fabricated-from-automode-start': function(source, defs) {
      var a = 'We are calculating the basal rate here using the Auto Mode start event from your pump history, but ';
      var b = ' did not directly provide us with these rate changes.';
      return defs.stitch(a, b, source);
    },
    'tandem/basal/fabricated-from-new-day': function(source, defs) {
      var a = 'We have fabricated this basal segment from a ';
      var b = ' new day event; it was not provided directly as basal data';
      return defs.stitch(a, b, source);
    },
    'basal/intersects-incomplete-suspend': function() {
      return 'Within this basal segment, we are omitting a suspend event that didn\'t end. This may have resulted from changing the date & time settings on the device or switching to a new device. As a result, this basal segment may be inaccurate.';
    },
    'basal/mismatched-series': function() {
      return 'A basal rate segment may be missing here because it wasn\'t reported to the Tidepool API in sequence. We can\'t be 100% certain of your basal rate here.';
    },
    'basal/unknown-duration': function(source, defs) {
      var a = 'Because of how ';
      var b = ' reports the data, we could not determine the duration of this basal rate segment.';
      return defs.stitch(a, b, source);
    },
    'stats-insufficient-data': function() {
      return 'There is not enough data to show this statistic.';
    },
    'stats-how-calculated-ratio': function() {
      return 'Basal insulin keeps your glucose within your target range when you are not eating.  Bolus insulin is mostly used to cover the carbohydrates you eat or to bring a high glucose back into your target range. This ratio allows you to compare how much of the insulin you are taking is used for each purpose. We will only show numbers if there is enough basal data - 24 hours in the one day view and 7 days in the two week view.';
    },
    'stats-how-calculated-range-cbg': function() {
      return 'With diabetes, any time in range is hard to achieve! This shows the percentage of time your CGM was in range, which can help you see how you are doing overall. We will only show a number if there is enough data - readings for at least 75% of the day in the one day view, and 75% of the day for at least half of the days shown in the two week view.';
    },
    'stats-how-calculated-range-smbg': function() {
      return 'With diabetes, any reading in range is hard to achieve! If you don’t wear a CGM or don’t have enough CGM data, this shows how many of your fingerstick readings were in range, which can help you see how you are doing overall. We will only show a number if there is enough data - at least 4 readings in the one day view, and at least 4 readings for at least half of the days shown in the two week view.';
    },
    'stats-how-calculated-average-cbg': function() {
      return 'To get one number that gives you a rough idea of your glucose level we add together all of the CGM glucose readings you have and then divide them by the number of glucose readings. We will only show a number if there is enough data - readings for at least 75% of the day in the one day view, and readings for at least 75% of the day for at least half of the days shown in the two week view.';
    },
    'stats-how-calculated-average-smbg': function() {
      return 'If you don’t wear a CGM or don’t have enough CGM data, to get one number that gives you a rough idea of your glucose level, we add together all of the fingerstick readings you have and then divide them by the number of readings. We will only show a number if there is enough data - at least 4 readings in the one day view, and at least 4 readings for at least half of the days shown in the two week view.';
    },
    'spring-forward': function() {
      return 'Spring forward! You may see your data overlap. Make sure you update the time on all your devices.';
    },
    'time-change': function() {
      return 'The date and/or time settings of your device were changed recently, and this datum may overlap in the timeline display with other data from the same device.';
    }
  },
  default: function(source) {
    if (source == null) {
      return 'We can\'t be 100% certain of the data displayed here.';
    }
    var a = 'We can\'t be 100% certain of the data displayed here because of how ';
    var b = ' reports the data.';
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
