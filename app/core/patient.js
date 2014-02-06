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

var patientValidators = {
  isValidYear: function() {
    return function(value) {
      var error = 'Not a valid year.';
      
      if (value.length < 4) {
        return error;
      }

      var isPositiveInteger = parseInt(value, 10) > 0;
      if (!isPositiveInteger) {
        return error;
      }
    };
  }
};

_.assign(patient, {
  _attributes: {
    birthday: {
      validate: validation.series([
        validation.required(),
        validation.isValidDate()
      ])
    },
    diagnosisYear: {
      validate: validation.series([
        validation.required(),
        patientValidators.isValidYear()
      ])
    },
    aboutMe: {validate: validation.hasLengthLessThan(MAX_ABOUTME_LENGTH)}
  },

  formatDate: function(value) {
    return moment(value).format(DATE_FORMAT);
  }
});

module.exports = patient;