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
var publicPersonInfo = common.publicPersonInfo;

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

  function getPendingInvitation(options) {
    return _.find(data.confirmations, function(confirmation) {
      var match = (
        confirmation.type === 'invite' &&
        confirmation.invitedBy === options.from &&
        confirmation.status === 'pending'
      );

      if (options.to) {
        match = match && confirmation.userid === options.to;
      }
      if (options.email) {
        match = match && confirmation.email === options.email;
      }

      return match;
    });
  }

  var setPermissions = common.setPermissions.bind(null, data);

  api.invitation.getReceived = function(callback) {
    api.log('[mock] GET /invitations/received');

    setTimeout(function() {
      var invitations = _.filter(data.confirmations, function(confirmation) {
        return (
          confirmation.type === 'invite' &&
          confirmation.userid === api.userId &&
          confirmation.status === 'pending'
        );
      });

      invitations = _.map(invitations, function(invitation) {
        return _.omit(invitation, 'type', 'status', 'userid', 'email');
      });

      invitations = _.map(invitations, function(invitation) {
        var fromUserId = invitation.invitedBy;
        var from = data.users[fromUserId];
        from = _.cloneDeep(from);
        from = publicPersonInfo(from);
        return _.assign({}, _.omit(invitation, 'invitedBy'), {
          from: from
        });
      });

      callback(null, invitations);
    }, getDelayFor('api.invitation.getReceived'));
  };

  api.invitation.accept = function(fromUserId, callback) {
    api.log('[mock] POST /invitations/from/' + fromUserId + '/accept');

    setTimeout(function() {
      var userId = api.userId;

      var invitation = getPendingInvitation({
        from: fromUserId,
        to: userId
      });

      if (!invitation) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      setPermissions(fromUserId, userId, invitation.permissions);
      // Note: we are mutating the object in the mock data here
      invitation.status = 'confirmed';

      callback();
    }, getDelayFor('api.invitation.accept'));
  };

  api.invitation.dismiss = function(fromUserId, callback) {
    api.log('[mock] POST /invitations/from/' + fromUserId + '/dismiss');

    setTimeout(function() {
      var userId = api.userId;

      var invitation = getPendingInvitation({
        from: fromUserId,
        to: userId
      });

      if (!invitation) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      // Note: we are mutating the object in the mock data here
      invitation.status = 'dismissed';

      callback();
    }, getDelayFor('api.invitation.dismiss'));
  };

  api.invitation.getSent = function(callback) {
    api.log('[mock] GET /invitations/sent');
    
    setTimeout(function() {
      var invitations = _.filter(data.confirmations, function(confirmation) {
        return (
          confirmation.type === 'invite' &&
          confirmation.invitedBy === api.userId &&
          confirmation.status === 'pending'
        );
      });

      invitations = _.map(invitations, function(invitation) {
        return _.omit(invitation, 'type', 'status', 'userid', 'invitedBy');
      });

      callback(null, invitations);
    }, getDelayFor('api.invitation.getSent'));
  };

  api.invitation.cancel = function(toEmail, callback) {
    api.log('[mock] POST /invitations/to/' + toEmail + '/cancel');

    setTimeout(function() {
      var userId = api.userId;

      var invitation = getPendingInvitation({
        from: userId,
        email: toEmail
      });

      if (!invitation) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      // Note: we are mutating the object in the mock data here
      invitation.status = 'canceled';

      callback();
    }, getDelayFor('api.invitation.cancel'));
  };

  return api;
};

module.exports = patch;
