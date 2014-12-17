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

'use strict';

var crypto = require('crypto');

/**
 * Generates an id by
 *
 * 1. concatenating the provided fields together
 * 2. hashing the concatenation
 * 3. base64 encoding the result with a hyphen as the padding character
 *
 * This algorithm uses the hyphen as the padding character in order to generate URL-safe ids.
 *
 * Also, when we concatenate the values together, we inject a delimiter (underscore) in order
 * to protect from unforeseen collisions.  For example, if provided with the following two arrays
 *
 * ["bob", "omaley"]
 * ["bobo", "maley"]
 *
 * Just a straight concatenation would result in "bobomaley" and ultimately the same id.  By
 * adding a delimiter, we actually produce two different concatenations ("bob_omaley" and "bobo_maley")
 * which will result in different ids.
 *
 * @param fields an array of values to be concatenated together into a unique string
 * @returns {string}
 */
exports.generateId = function(fields) {
  var hasher = crypto.createHash('sha1');

  for (var i = 0; i < fields.length; ++i) {
    var val = fields[i];
    if (val == null) {
      throw new Error('null value in fields');
    }
    hasher.update(String(val));
    hasher.update('_');
  }

  return hasher.digest('base64');
};

