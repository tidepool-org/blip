// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var async = require('async');
var _ = require('lodash');

module.exports = function (common, deps) {

  var superagent = deps.superagent;
  var findProfile = deps.findProfile;

  return {
    /**
     * Start signup
     *
     * @param {String} invitedId - id of the user that signup if for
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    signupStart: function (invitedId, cb) {
      common.assertArgumentsSize(arguments, 2);
      common.doPostWithToken(
        '/confirm/send/signup/'+invitedId,
        { 201: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Confirm a signup
     *
     * @param {String} invitedId - id of the user that signup if for
     * @param {String} signupId - id of the signup
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    signupConfirm: function (invitedId, signupId, cb) {
      common.assertArgumentsSize(arguments, 3);

      common.doPutWithToken(
        '/confirm/accept/signup/'+invitedId+'/'+signupId,
        {'key':signupId},
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Resend an existing invite
     *
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    signupResend: function (invitedId, cb) {
      common.assertArgumentsSize(arguments, 2);
      common.doPostWithToken(
        '/confirm/resend/signup/'+invitedId,
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Cancel an existing invite
     *
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    signupCancel: function (invitedId, cb) {
      common.assertArgumentsSize(arguments, 2);
      common.doPutWithToken(
        '/confirm/signup/'+invitedId,
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Get the invites sent
     *
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    invitesSent: function (inviterId, cb) {
      common.assertArgumentsSize(arguments, 2);
      common.doGetWithToken(
        '/confirm/invite/'+inviterId,
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Get the invites received
     *
     * @param {String} inviteeId - id of the user who was invited
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    invitesReceived: function (inviteeId,cb) {
      common.assertArgumentsSize(arguments, 2);

      var self = this;

      superagent
        .get(common.makeUrl('/confirm/invitations/'+inviteeId))
        .set(common.SESSION_TOKEN_HEADER, myToken)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }
          if (res.status === 200) {
            // Replace `creatorId` with a `creator` user object
            async.map(res.body, function (invite, callback) {
              self.findProfile(invite.creatorId,function(err,profile){
                invite.creator = {
                  userid: invite.creatorId,
                  profile: profile
                };
                invite = _.omit(invite, 'creatorId');

                callback(err,invite);
              });
            }, function(err, invites){
              return cb(null,invites);
            });
          } else if (res.status === 404){
            return cb(null,[]);
          } else {
            return cb(res.body,[]);
          }
        });
    },
    /**
     * Invite a user
     *
     * @param {String} email - email of the user to invite
     * @param {Object} permissions - permissions to be given
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    inviteUser: function (email, permissions, inviterId, cb) {
      common.assertArgumentsSize(arguments, 4);

      var details = { 'email':email,'permissions': permissions };

      common.doPostWithToken(
        '/confirm/send/invite/'+inviterId,
        details,
        cb
      );
    },
    /**
     * Accept the invite
     *
     * @param {String} inviteId
     * @param {String} inviteeId - id of the user who was invited
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    acceptInvite: function (inviteId, inviteeId ,inviterId, cb) {
      common.assertArgumentsSize(arguments, 4);

      common.doPutWithToken(
        '/confirm/accept/invite/'+ inviteeId +'/'+ inviterId,
        {'key':inviteId},
        cb
      );
    },
    /**
     * Dismiss the invite
     *
     * @param {String} inviteId
     * @param {String} inviteeId - id of the user who was invited
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    dismissInvite: function (inviteId, inviteeId ,inviterId, cb) {
      common.assertArgumentsSize(arguments, 4);

      common.doPutWithToken(
        '/confirm/dismiss/invite/'+ inviteeId +'/'+ inviterId,
        {'key':inviteId},
        { 200: null},
        cb
      );
    },
    /**
     * Remove the invite
     *
     * @param {String} email - email of the user to remove
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    removeInvite: function (email, inviterId, cb) {
      common.assertArgumentsSize(arguments, 3);

      common.doPutWithToken(
        '/confirm/'+inviterId+'/invited/'+email,
        null,
        cb
      );
    },
    /**
     * Request a password reset
     *
     * @param {String} email - email of the user requesting the password reset
     * @param cb
     * @returns {cb}  cb(err)
     */
    requestPasswordReset: function (email, cb) {
      common.assertArgumentsSize(arguments, 2);

      superagent
       .post(common.makeUrl('/confirm/send/forgot/' + email))
       .end(function (err, res) {
        if (err != null) {
          return cb(err);
        }
        if (res.status !== 200) {
          return cb({status:res.status,message:res.error});
        }
        return cb();
      });
    },
    /**
     * Confirm a password reset request with a new password
     *
     * @param {Object} payload - object with `key`, `email`, `password`
     * @param cb
     * @returns {cb}  cb(err)
     */
    confirmPasswordReset: function (payload, cb) {
      common.assertArgumentsSize(arguments, 2);
      //fail fast
      if( _.isEmpty(payload.key) || _.isEmpty(payload.email) || _.isEmpty(payload.password) ){
        return cb({ status : common.STATUS_BAD_REQUEST, body:'payload requires object with `key`, `email`, `password`'});
      }

      superagent
       .put(common.makeUrl('/confirm/accept/forgot'))
       .send(payload)
       .end(function (err, res) {
        if (err != null) {
          return cb(err);
        }
        if (res.status !== 200) {
          return cb({status:res.status,message:res.error});
        }
        return cb();
      });
    }
  };
};
