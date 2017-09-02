// == BSD2 LICENSE ==
// Copyright (c) 2015, Tidepool Project
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

function defaultProperty(obj, property, defaultValue) {
  if (obj[property] == null) {
    obj[property] = defaultValue;
  }
  return obj;
}

function requireProperty(objectName, obj, property) {
  var value = obj[property];
  if (value == null) {
    throw new Error('Property [' + property + '] required on ' + objectName);
  }
  return value;
}

var requireDep = requireProperty.bind(null, 'deps');

module.exports = function (common, config, deps) {

  var myToken = null;
  var myUserId = null;
  // This is a 'version' counter for the number of times we've logged in.
  // It is used to invalidate stale attempts at refreshing a token
  var loginVersion = 0;
  var TOKEN_LOCAL_KEY = 'authToken';

  /*jshint unused:false */
  var log = requireDep(deps,'log');
  var store = requireDep(deps, 'localStore');
  var superagent = requireDep(deps, 'superagent');

  //config
  config = _.clone(config);
  defaultProperty(config, 'tokenRefreshInterval', 10 * 60 * 1000); // 10 minutes

  /**
   * Initialize client for user
   *
   * @param cb
   */
  function initialize(cb) {

    myToken = store.getItem(TOKEN_LOCAL_KEY);
    common.syncToken(myToken);

    if (myToken == null) {
      log.info('No local session found');
      return cb();
    }

    refreshUserToken(myToken, function(err, data) {
      var hasNewSession = data && data.userid && data.token;

      if (err || !hasNewSession) {
        log.info('Local session invalid', err, data);
        saveSession(null, null);
        return cb();
      }

      log.info('Loaded local session');
      saveSession(data.userid, data.token, {remember:true});
      cb(null, {userid: data.userid, token: data.token});
    });
  }

  function refreshUserToken(token, cb) {
    superagent.get(common.makeAPIUrl('/auth/login'))
      .set(common.SESSION_TOKEN_HEADER, token)
      .end(
      function (err, res) {
        if (err) {
          err.body = (err.response && err.response.body) || '';
          return cb(err, null);
        }
        if (res.status !== 200) {
          return common.handleHttpError(res, cb);
        }

        return cb(null, {userid: res.body.userid, token: res.headers[common.SESSION_TOKEN_HEADER]});
      });
  }
  /**
   * Save user session (in-memory and stored in browser)
   */
  function saveSession(newUserId, newToken, options) {
    options = options || {};
    myToken = newToken;
    common.syncToken(myToken);
    myUserId = newUserId;

    // Store and increment the loginVersion.  This is a mechanism to nullify any refreshSession calls that
    // are waiting for their timeout to run.
    var currVersion = ++loginVersion;

    if (newToken == null) {
      store.removeItem(TOKEN_LOCAL_KEY);
      log.info('Destroyed local session');
      return;
    }

    log.info('Session saved');

    if (options.remember) {
      store.setItem(TOKEN_LOCAL_KEY, newToken);
      log.info('Saved session locally');
    }

    var refreshSession = function() {
      if (myToken == null || currVersion !== loginVersion) {
        log.info('Stopping session token refresh for version', currVersion);
        return;
      }

      log.info('Refreshing session token');
      refreshUserToken(myToken, function(err, data) {
        var hasNewSession = data && data.userid && data.token;
        if (err || !hasNewSession) {
          log.warn('Failed refreshing session token', err);
          saveSession(null, null);
        } else {
          saveSession(data.userid, data.token, options);
        }
      });
    };

    setTimeout(refreshSession, config.tokenRefreshInterval);
  }
  /**
   * Destroy user session (in-memory and stored in browser)
   */
  function destroySession() {
    return saveSession(null, null);
  }
  /**
   * Tells if the current client is logged in
   *
   * @returns {boolean} true if logged in
   */
  function isLoggedIn() {
    return myToken != null;
  }
  /**
   * Returns the logged in user's id
   *
   * @returns {String} userid or null if not logged in
   */
  function getUserId() {
    return myUserId;
  }
  /**
   * Returns the logged in user's token
   *
   * @returns {String} users token
   */
  function getUserToken(){
    return myToken;
  }
  /**
   * Login user to the Tidepool platform using the provided oauth token
   *
   * @param provided oauth token
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function oauthLogin(oauthToken, cb) {

    superagent
      .post(common.makeAPIUrl('/auth/oauthlogin'))
      .set('Authorization', 'bearer '+oauthToken)
      .end(
      function (err, res) {

        if (err != null) {
          err.body = (err.response && err.response.body) || '';
          return cb(err, null);
        }

        if (res.status !== 200) {
          return common.handleHttpError(res, cb);
        }

        var oauthUserId = res.body.oauthUser.userid;
        var theToken = res.headers[common.SESSION_TOKEN_HEADER];
        //save the session and remember by default
        saveSession(oauthUserId, theToken, {remember:true});
        return cb(null,{userid: oauthUserId, user: res.body.oauthUser, target: res.body.oauthTarget});
      });
  }
  /**
   * Login user to the Tidepool platform
   *
   * @param user object with a username and password to login
   * @param options (optional) object with `remember` boolean attribute
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function login(user, options, cb) {
    options = options || {};
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (user.username == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a username' });
    }
    if (user.password == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a password' });
    }

    superagent
      .post(common.makeAPIUrl('/auth/login', user.longtermkey))
      .auth(user.username, user.password)
      .end(
      function (err, res) {
        if (err != null) {
          err.body = (err.response && err.response.body) || '';
          return cb(err, null);
        }

        if (res.status !== 200) {
          return common.handleHttpError(res, cb);
        }

        var theUserId = res.body.userid;
        var theToken = res.headers[common.SESSION_TOKEN_HEADER];

        saveSession(theUserId, theToken, options);
        return cb(null,{userid: theUserId, user: res.body});
      });
  }
  /**
   * Logout user
   *
   * @returns {cb}  cb(err, response)
   */
  function logout(cb) {
    common.assertArgumentsSize(arguments, 1);

    if (isLoggedIn() === false) {
      setTimeout(function(){ cb(null, {}); }, 0);
    }

    var onSuccess=function(res){
      saveSession(null, null);
      return res.status;
    };

    common.doPostWithToken(
      '/auth/logout',
      {},
      {200: onSuccess},
      cb
    );
  }
  /**
   * Signup user to the Tidepool platform
   *
   * @param user object with a username and password
   * @param options (optional) object with `remember` boolean attribute
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function signup(user, options, cb) {
    options = options || {};
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (user.username == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a username' });
    }
    if (user.password == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a password' });
    }

    var newUser = _.pick(user, 'username', 'password', 'emails', 'roles');

    superagent
      .post(common.makeAPIUrl('/auth/user'))
      .send(newUser)
      .end(
      function (err, res) {
        if (err != null) {
          err.body = (err.response && err.response.body) || '';
          return cb(err);
        }
        var theUserId = res.body.userid;
        var theToken = res.headers[common.SESSION_TOKEN_HEADER];

        saveSession(theUserId, theToken, options);
        return cb(null,res.body);
      });
  }
  /**
   * Create a custodial account for the logged in user
   *
   * @param profile {Object} profile for account that is being created for
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function createCustodialAccount(profile, cb) {

    if (_.isEmpty(profile.fullName)) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a fullName' });
    }

    var custodialUser = {};
    // create an custodial account to attach to ours
    function createAccount(next){
      var body = {};
      if(!_.isEmpty(profile.emails)){
        body.emails = profile.emails;
        body.username = profile.emails[0];
      }
      superagent
       .post(common.makeAPIUrl('/auth/user/' + getUserId() + '/user'))
       .set(common.SESSION_TOKEN_HEADER, getUserToken())
       .send(body)
       .end(
       function (err, res) {
        if (err != null) {
          err.body = (err.response && err.response.body) || '';
          err.message = (err.response && err.response.error) || '';
          return next(err);
        }
        if(res.status === 201){
          custodialUser.id = res.body.userid;
          return next(null,{userid:res.body.userid});
        }
        return next({status:res.status,message:res.error});
      });
    }
    //add a profile name to the child account
    function createProfile(next){
      superagent
        .put(common.makeAPIUrl('/metadata/'+ custodialUser.id + '/profile'))
        .send(profile)
        .set(common.SESSION_TOKEN_HEADER, getUserToken())
        .end(
          function (err, res) {
            if (err != null) {
              err.body = (err.response && err.response.body) || '';
              err.message = (err.response && err.response.error) || '';
              return next(err);
            }
            if(res.status === 200){
              return next(null,res.body);
            }
            return next({status:res.status,message:res.error});
          });
    }
    // optionally send a confirmation email if email was provided
    function sendEmailConfirmation(next){
      if(_.isEmpty(profile.emails)){
        return next(null);
      }
      superagent
        .post(common.makeAPIUrl('/confirm/send/signup/'+custodialUser.id))
        .set(common.SESSION_TOKEN_HEADER, getUserToken())
        .send({})
        .end(
          function (err, res) {
            if (err != null) {
              err.body = (err.response && err.response.body) || '';
              err.message = (err.response && err.response.error) || '';
              return next(err);
            }
            if(res.status === 200){
              return next(null,res.body);
            }
            return next({status:res.status,message:res.error});
          });
    }

    async.series([
      createAccount,
      createProfile,
      sendEmailConfirmation
    ], function(err, results) {
      if(_.isEmpty(err)){
        var acct = {
          userid: results[0].userid,
          profile: results[1]
        };
        return cb(null,acct);
      }
      return cb(err);
    });
  }
  /**
   * Update current user account info
   *
   * @param {Object} user object with account info
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function updateCurrentUser(user, cb) {
    common.assertArgumentsSize(arguments, 2);
    var updateData = {
      updates: _.pick(user, 'username', 'password', 'emails', 'termsAccepted')
    };

    common.doPutWithToken('/auth/user', updateData, cb);
  }
  /**
   * Update custodial user account info
   *
   * @param {Object} user object with account info
   * @param custodial user id
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function updateCustodialUser(user, id, cb) {
    common.assertArgumentsSize(arguments, 3);
    var updateData = {
      updates: _.pick(user, 'username', 'password', 'emails', 'termsAccepted')
    };

    common.doPutWithToken('/auth/user/' + id, updateData, cb);
  }
  /**
   * Add or update the date the user accepted the terms and conditions
   *
   * @param {Object} user object with the attached terms info
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function acceptTerms(user, cb) {
    common.assertArgumentsSize(arguments, 2);

    if(_.isEmpty(user.terms)){
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a terms field' });
    }

    var updateUserTerms = {
      updates: _.pick(user, 'terms')
    };

    common.doPutWithToken('/auth/user', updateUserTerms, cb);
  }
  /**
   * Get current user account info
   *
   * @returns {cb}  cb(err, response)
   */
  function getCurrentUser(cb) {
    common.assertArgumentsSize(arguments, 1);
    common.doGetWithToken('/auth/user', cb);
  }
  /**
   * Create a restricted token for a given user. One that is only usable for a limited
   * period of time to a limited set of APIs.
   *
   * @param {String} userId of the user to create a restricted token for
   * @param {String} restrictedTokenRequest the restricted token requested access
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function createRestrictedTokenForUser(userId, restrictedTokenRequest, cb) {
    common.assertArgumentsSize(arguments, 3);

    common.doPostWithToken(
      '/v1/users/' + userId + '/restricted_tokens',
      restrictedTokenRequest,
      { 201: function(res) { return res.body; } },
      cb
    );
  }
  /**
   * Create the OAuth provider authorization for the specified provider and restricted token.
   *
   * @param {String} provider the provider
   * @param {String} restrictedToken the restricted token
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function createOAuthProviderAuthorization(provider, restrictedToken, cb) {
    common.assertArgumentsSize(arguments, 3);

    var authorizationURL = common.makeAPIUrl('/v1/oauth/' + provider + '/authorize');
    authorizationURL += '?restricted_token=' + restrictedToken;

    cb(null, authorizationURL);
  }
  /**
   * Delete the OAuth provider authorization for the specified provider.
   *
   * @param {String} provider the provider
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function deleteOAuthProviderAuthorization(provider, cb) {
    common.assertArgumentsSize(arguments, 2);

    superagent
      .del(common.makeAPIUrl('/v1/oauth/' + provider + '/authorize'))
      .set(common.SESSION_TOKEN_HEADER, getUserToken())
      .end(
      function(err, res) {
        if (err != null) {
          err.body = (err.response && err.response.body) || '';
          err.message = (err.response && err.response.error) || '';
          return cb(err);
        }
        if (res.status === 200) {
          return cb(null, res.body);
        }
        return cb({ status: res.status, message: res.error });
      });
  }

  return {
    acceptTerms : acceptTerms,
    createCustodialAccount : createCustodialAccount,
    destroySession: destroySession,
    getCurrentUser : getCurrentUser,
    getUserId : getUserId,
    getUserToken : getUserToken,
    isLoggedIn: isLoggedIn,
    login : login,
    oauthLogin : oauthLogin,
    logout : logout,
    signup : signup,
    initialize : initialize,
    updateCurrentUser : updateCurrentUser,
    updateCustodialUser: updateCustodialUser,
    createRestrictedTokenForUser: createRestrictedTokenForUser,
    createOAuthProviderAuthorization: createOAuthProviderAuthorization,
    deleteOAuthProviderAuthorization: deleteOAuthProviderAuthorization
  };
};
