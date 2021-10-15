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
import i18next from 'i18next';

import format from '../../../data/util/format';

const t = i18next.t.bind(i18next);

const definitions = {
  DISABLED: [
    'basal/auto',
    'bg/out-of-range',
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
    'wizard/target-automated',
  ],
  LEAD_TEXT: {
    'stats-insufficient-data': function() {
      return t('Why is this grey?');
    },
    'stats-how-calculated': function() {
      return t('What is this?');
    }
  },
  MAIN_TEXT: {
    'bg/out-of-range': function(source, defs) {
      source = defs.sourceText(source);
      return t("This BG value was above or below {{source}}'s threshold for reporting a numerical value. Your actual BG value was higher or lower than displayed.", {source: source});
    },
    'basal/intersects-incomplete-suspend': function() {
      return t("Within this basal segment, we are omitting a suspend event that didn't end. This may have resulted from changing the date & time settings on the device or switching to a new device. As a result, this basal segment may be inaccurate.");
    },
    'basal/mismatched-series': function() {
      return t("A basal rate segment may be missing here because it wasn't reported to the Tidepool API in sequence. We can't be 100% certain of your basal rate here.");
    },
    'basal/unknown-duration': function(source, defs) {
      return t('Because of how {{source}} reports the data, we could not determine the duration of this basal rate segment.', {source: source});
    },
    'stats-insufficient-data': function() {
      return t('There is not enough data to show this statistic.');
    },
    'stats-how-calculated-ratio': function() {
      return t('Basal insulin keeps your glucose within your target range when you are not eating.  Bolus insulin is mostly used to cover the carbohydrates you eat or to bring a high glucose back into your target range. This ratio allows you to compare how much of the insulin you are taking is used for each purpose. We will only show numbers if there is enough basal data - 24 hours in the one day view and 7 days in the two week view.');
    },
    'stats-how-calculated-range-cbg': function() {
      return t('With diabetes, any time in range is hard to achieve! This shows the percentage of time your CGM was in range, which can help you see how you are doing overall. We will only show a number if there is enough data - readings for at least 75% of the day in the one day view, and 75% of the day for at least half of the days shown in the two week view.');
    },
    'stats-how-calculated-range-smbg': function() {
      return t('With diabetes, any reading in range is hard to achieve! If you don’t wear a CGM or don’t have enough CGM data, this shows how many of your fingerstick readings were in range, which can help you see how you are doing overall. We will only show a number if there is enough data - at least 4 readings in the one day view, and at least 4 readings for at least half of the days shown in the two week view.');
    },
    'stats-how-calculated-average-cbg': function() {
      return t('To get one number that gives you a rough idea of your glucose level we add together all of the CGM glucose readings you have and then divide them by the number of glucose readings. We will only show a number if there is enough data - readings for at least 75% of the day in the one day view, and readings for at least 75% of the day for at least half of the days shown in the two week view.');
    },
    'stats-how-calculated-average-smbg': function() {
      return t('If you don’t wear a CGM or don’t have enough CGM data, to get one number that gives you a rough idea of your glucose level, we add together all of the fingerstick readings you have and then divide them by the number of readings. We will only show a number if there is enough data - at least 4 readings in the one day view, and at least 4 readings for at least half of the days shown in the two week view.');
    },
    'spring-forward': function() {
      return t('Spring forward! You may see your data overlap. Make sure you update the time on all your devices.');
    },
    'time-change': function() {
      return t('The date and/or time settings of your device were changed recently, and this datum may overlap in the timeline display with other data from the same device.');
    }
  },
  default: function(source) {
    if (source == null) {
      return t("We can't be 100% certain of the data displayed here.");
    }
    var a = t("We can't be 100% certain of the data displayed here because of how ");
    var b = t(' reports the data.');
    return this.stitch(a, b, source);
  },
  main: function(annotation, source) {
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
  sourceText: function(source) {
    return source === 'carelink' ? ' CareLink' : format.capitalize(source);
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

export default definitions;
