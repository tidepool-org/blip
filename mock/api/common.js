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

var _ = require('lodash');

module.exports = {
  // http://pragmatic-coding.blogspot.ca/2012/01/javascript-pseudo-random-id-generator.html
  generateRandomId: function(length) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var returnValue = '';
    var x, i;

    for (x = 0; x < length; x += 1) {
      i = Math.floor(Math.random() * 62);
      returnValue += chars.charAt(i);
    }

    return returnValue;
  },

  publicPersonInfo: function(person) {
    return _.omit(person, 'password', 'username', 'emails');
  },

  setPermissions: function(data, groupId, memberId, permissions) {
    var groups = data.groups[memberId] || {};
    // Delete permissions
    if (_.isEmpty(permissions)) {
      groups = _.omit(groups, groupId);
    }
    // Set permissions
    else {
      groups[groupId] = _.cloneDeep(permissions);
    }
    data.groups[memberId] = groups;
  },

  getMembersForGroup: function(data, groupId) {
    var self = this;
    return _.reduce(data.groups, function(result, memberGroups, memberId) {
      if (memberId === groupId) {
        return result;
      }

      var permissions = memberGroups[groupId];
      if (!permissions) {
        return result;
      }

      var member = data.users[memberId];
      member = self.publicPersonInfo(member);
      member.permissions = permissions;
      result.push(member);
      return result;
    }, []);
  },

  getUserWithEmail: function(data, email) {
    return _.find(data.users, function(user, id) {
      return _.contains(user.emails, email);
    });
  }
};
