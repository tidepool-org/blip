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

var common = require('./common');

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

  var setPermissions = common.setPermissions.bind(null, data);

  api.access.setMemberPermissions = function(memberId, permissions, callback) {
    var groupId = api.userId;
    api.log('[mock] PUT /access/' + groupId + '/' + memberId);

    setTimeout(function() {
      setPermissions(groupId, memberId, permissions);
      callback();
    }, getDelayFor('api.access.setMemberPermissions'));
  };

  api.access.removeMember = function(memberId, callback) {
    var groupId = api.userId;
    api.log('[mock] DELETE /access/' + groupId + '/' + memberId);

    setTimeout(function() {
      setPermissions(groupId, memberId, null);
      callback();
    }, getDelayFor('api.access.removeMember'));
  };

  api.access.leaveGroup = function(groupId, callback) {
    var memberId = api.userId;
    api.log('[mock] DELETE /access/' + groupId + '/' + memberId);

    setTimeout(function() {
      setPermissions(groupId, memberId, null);
      callback();
    }, getDelayFor('api.access.leaveGroup'));
  };

  return api;
};

module.exports = patch;
