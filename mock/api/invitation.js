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

var invitationTokenSize = 12;

function generateInvitationToken() {
  return common.generateRandomId(invitationTokenSize);
}

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

  function replaceInvitedByWithUser(invitation) {
    var fromUserId = invitation.invitedBy;
    var from = data.users[fromUserId];
    from = _.cloneDeep(from);
    from = publicPersonInfo(from);
    return _.assign({}, _.omit(invitation, 'invitedBy'), {
      from: from
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
        return _.pick(invitation, 'invitedBy', 'permissions');
      });

      invitations = _.map(invitations, replaceInvitedByWithUser);

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
        return _.pick(invitation, 'email', 'permissions');
      });

      callback(null, invitations);
    }, getDelayFor('api.invitation.getSent'));
  };

  api.invitation.send = function(toEmail, permissions, callback) {
    api.log('[mock] POST /invitations');

    setTimeout(function() {
      var err;
      var userId = api.userId;
      var existingInvitation = _.find(data.confirmations, function(confirmation) {
        return (
          confirmation.type === 'invite' &&
          confirmation.email === toEmail &&
          confirmation.invitedBy === userId
        );
      });

      if (existingInvitation) {
        err = {status: 409, response: 'Invitation already sent to that email'};
        return callback(err);
      }

      var invitation = {
        type: 'invite',
        status: 'pending',
        email: toEmail,
        invitedBy: userId,
        permissions: permissions,
        token: generateInvitationToken()
      };

      var existingUser = _.find(data.users, function(user, id) {
        return _.contains(user.emails, toEmail);
      });
      if (existingUser) {
        // Does user matched with email already belong to the group?
        var members = common.getMembersForGroup(data, userId);
        var existingMember = _.find(members, {userid: existingUser.userid});
        if (existingMember) {
          err = {status: 409, response: 'User with that email already part of the group'};
          return callback(err);
        }

        invitation.userid = existingUser.userid;
      }

      data.confirmations.push(invitation);

      invitation = _.pick(invitation, 'email', 'permissions');
      callback(null, invitation);
    }, getDelayFor('api.invitation.send'));
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

  api.invitation.getForToken = function(token, callback) {
    api.log('[mock] GET /invitations/token/' + token);

    setTimeout(function() {
      var invitation = _.find(data.confirmations, function(confirmation) {
        return (
          confirmation.type === 'invite' &&
          confirmation.token === token &&
          confirmation.status === 'pending'
        );
      });

      if (!invitation) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      invitation = replaceInvitedByWithUser(invitation);
      // If invitation was sent to existing user account, add user object
      if (invitation.userid) {
        var user = data.users[invitation.userid];
        user = _.cloneDeep(user);
        user = publicPersonInfo(user);
        invitation = _.assign({}, _.omit(invitation, 'userid'), {
          user: user
        });
      }

      invitation = _.pick(invitation, 'user', 'email', 'from', 'permissions');
      callback(null, invitation);
    }, getDelayFor('api.invitation.getForToken'));
  };

  return api;
};

module.exports = patch;
