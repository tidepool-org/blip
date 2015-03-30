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
   * Login user to the Tidepool platform
   *
   * @param user object with a username and password to login
   * @param options (optional) object with `remember` boolean attribute
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function login(user, options, cb) {

    if (user.username == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a username' });
    }
    if (user.password == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a password' });
    }

    options = options || {};
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    superagent
      .post(common.makeAPIUrl('/auth/login', user.longtermkey))
      .auth(user.username, user.password)
      .end(
      function (err, res) {
        if (err != null) {
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
      return res.body;
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
    if (user.username == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a username' });
    }
    if (user.password == null) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a password' });
    }

    options = options || {};
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    var newUser = _.pick(user, 'username', 'password', 'emails');

    superagent
      .post(common.makeAPIUrl('/auth/user'))
      .send(newUser)
      .end(
      function (err, res) {
        if (err != null) {
          return cb(err);
        }
        var theUserId = res.body.userid;
        var theToken = res.headers[common.SESSION_TOKEN_HEADER];

        saveSession(theUserId, theToken, options);
        return cb(null,res.body);
      });
  }
  /**
   * Create a child account for the logged in user
   *
   * @param profile {Object} profile for account that is being created for
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function createChildAccount(profile,cb) {

    if (_.isEmpty(profile.fullName)) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a fullName' });
    }

    var childUser = { username: profile.fullName };
    // create an child account to attach to ours
    function createAccount(next){
      superagent
       .post(common.makeAPIUrl('/auth/childuser'))
       .send(childUser)
       .end(
       function (err, res) {
        if (err != null) {
          return next(err);
        }
        if(res.status === 201){
          childUser.id = res.body.userid;
          childUser.token = res.headers[common.SESSION_TOKEN_HEADER];
          return next(null,{userid:res.body.userid});
        }
        return next({status:res.status,message:res.error});
      });
    }
    //add a profile name to the child account
    function createProfile(next){
      superagent
        .put(common.makeAPIUrl('/metadata/'+ childUser.id + '/profile'))
        .send(profile)
        .set(common.SESSION_TOKEN_HEADER, childUser.token)
        .end(
          function (err, res) {
            if (err != null) {
              return next(err);
            }
            if(res.status === 200){
              return next(null,res.body);
            }
            return next({status:res.status,message:res.error});
          });
    }
    //give the parent account admin perms on the child account
    function giveRootPermsOnChild(next){
      superagent
        .post(common.makeAPIUrl('/access/'+ childUser.id + '/' +getUserId()))
        .send({admin: {}})
        .set(common.SESSION_TOKEN_HEADER, childUser.token)
        .end(
          function (err, res) {
            if (err != null) {
              return cb(err);
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
      giveRootPermsOnChild
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
      updates: _.pick(user, 'username', 'password', 'emails')
    };

    common.doPutWithToken('/auth/user', updateData, cb);
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
  return {
    acceptTerms : acceptTerms,
    createChildAccount : createChildAccount,
    destroySession: destroySession,
    getCurrentUser : getCurrentUser,
    getUserId : getUserId,
    getUserToken : getUserToken,
    isLoggedIn: isLoggedIn,
    login : login,
    logout : logout,
    signup : signup,
    initialize : initialize,
    updateCurrentUser : updateCurrentUser
  };
};
