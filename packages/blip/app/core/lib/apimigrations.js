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

import _ from 'lodash';

const migrations = {
  // Migrate from user profile `firstName`, `lastName` attributes to `fullName`
  profileFullName: {
    isRequired: (profile = {}) => {
      if (_.isEmpty(profile.fullName)) {
        // We only want to require a migration if first and/or last name attributes exist
        // so that we don't attempt to perform it in situations where `fullName` is
        // expected to be empty, such as immediately after signup.
        return !(_.isEmpty(profile.firstName) || _.isEmpty(profile.lastName));
      }
      return false;
    },
    migrate: (profile = {}) => {
      const p = _.cloneDeep(profile);
      p.fullName = `${p.firstName} ${p.lastName}`;
      return p;
    }
  },

  country: {
    isRequired: (settings) => {
      return _.isEmpty(settings) || (_.isObject(settings) && _.isEmpty(settings.country));
    },
    migrate: (settings = {}) => {
      const s = _.cloneDeep(settings);
      s.country = 'FR';
      return s;
    }
  },

  bgUnits: {
    isRequired: (settings) => {
      return !_.isEmpty(settings) && _.has(settings, 'bg') && !_.has(settings, 'units.bg');
    },
    migrate: (settings = {}) => {
      const units = _.get(settings, 'bg', 'mg/dL');
      const s = _.cloneDeep(settings);
      delete s.bg;
      if (_.isEmpty(s.units) || !_.isObject(s.units)) {
        s.units = {};
      }
      s.units.bg = units;
      return s;
    }
  },
};

export default migrations;
