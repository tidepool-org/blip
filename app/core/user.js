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

var validation = require('./lib/validation');

var user = {};

_.assign(user, validation.mixin);

var userValidators = {
  equalsPassword: function() {
    return function(value, attributes) {
      if (value !== attributes.password) {
        return 'Passwords don\'t match';
      }
    };
  }
};

_.assign(user, {
  _attributes: {
    username: {validate: validation.required()},
    password: {validate: validation.required()},
    passwordConfirm: {
      validate: validation.series([
        validation.required(),
        userValidators.equalsPassword()
      ]),
      validateOnlyIf: function(attributes) {
        return _.has(attributes, 'password');
      }
    },
    fullName: {validate: validation.required()}
  },

  getAttributeNames: function() {
    var names = _.omit(this._attributes, 'passwordConfirm');
    names = _.keys(names);
    names = ['id'].concat(names);
    return names;
  },

  getPatientData: function(attributes) {
    if (!(attributes && attributes.patient)) {
      return {};
    }

    var patient = _.extend(attributes.patient, {
      fullName: attributes.fullName
    });

    return patient;
  },

  isUserPatient: function(userAttr, patientAttr) {
    userAttr = userAttr || {};
    var userPatientAttr = userAttr.patient || {};
    patientAttr = patientAttr || {};

    if (!(patientAttr.id && userPatientAttr.id)) {
      return false;
    }

    return (patientAttr.id === userPatientAttr.id);
  }
});

module.exports = user;
