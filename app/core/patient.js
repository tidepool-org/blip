/**
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
 */

var _ = window._;
var moment = window.moment;

var validation = require('./lib/validation');

var MAX_ABOUTME_LENGTH = 256;
var DATE_FORMAT = 'YYYY-MM-DD';

var patient = {};

_.assign(patient, validation.mixin);

_.assign(patient, {
  _attributes: {
    birthday: {
      validate: validation.series([
        validation.required(),
        validation.isValidDate()
      ])
    },
    diagnosisDate: {
      validate: validation.series([
        validation.required(),
        validation.isValidDate()
      ])
    },
    aboutMe: {validate: validation.hasLengthLessThan(MAX_ABOUTME_LENGTH)}
  },

  formatDate: function(value) {
    return moment(value).format(DATE_FORMAT);
  },

  getYearsAgo: function(date) {
    return moment().diff(date, 'years');
  },

  getYearsOldText: function(date) {
    var result = this.getYearsAgo(date);

    if (result === 1) {
      return result + ' year old';
    }

    if (result > 1) {
      return result + ' years old';
    }
  },

  getYearsAgoText: function(date) {
    var result = this.getYearsAgo(date);

    if (result === 0) {
      return 'This year';
    }

    if (result === 1) {
      return result + ' year ago';
    }

    if (result > 1) {
      return result + ' years ago';
    }
  }
});

module.exports = patient;