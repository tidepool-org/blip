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

// Tools to migrate to new API data models or endpoints

var _ = require('lodash');

var migrations = {};

// Migrate from user profile `firstName`, `lastName` attributes to `fullName`
migrations.profileFullName = {
  isRequired: function(profile = {}) {
    if (!profile.fullName) {
      // We only want to require a migration if first and/or last name attributes exist
      // so that we don't attempt to perform it in situations where `fullName` is
      // expected to be empty, such as immediately after signup.
      return !!(profile.firstName || profile.lastName);
    }
    return false;
  },

  migrate: function(profile = {}) {
    profile.fullName = profile.firstName + ' ' + profile.lastName;
    profile = _.omit(profile, 'firstName', 'lastName');
    return profile;
  }
};

module.exports = migrations;
