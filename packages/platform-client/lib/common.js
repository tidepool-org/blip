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

var _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

module.exports = function (cfg, deps) {

  var superagent = _.clone(deps.superagent);
  var config = _.clone(cfg);

  // We want local copies of the config variables so we can change them on demand
  var apihost = config.host;
  var uploadhost = config.uploadApi;
  var dataHost = config.dataHost;
  var bliphost = config.bliphost;

  var usersToken;
  var sessionTrace = config.sessionTrace || uuidv4();

  //constants
  var SESSION_TOKEN_HEADER = 'x-tidepool-session-token';
  var TRACE_SESSION_HEADER = 'x-tidepool-trace-session';
  var DIGEST_HEADER = 'Digest';
  var STATUS_BAD_REQUEST = 400;
  var STATUS_UNAUTHORIZED = 401;
  var STATUS_UNAUTHORIZED_MSG = 'User is not logged in, you must log in to do this operation';
  var STATUS_OFFLINE = 503;
  var STATUS_OFFLINE_MSG = 'User appears to be offline';

  //are we online?
  function hasConnection(){
    try{
      return navigator.onLine;
    }catch(e){
      //can't test so just assume
      return true;
    }
  }

  function isLoggedIn(){
    return usersToken != null;
  }

  function syncToken(newToken){
    usersToken = newToken;
  }

  function getToken() {
    return usersToken;
  }

  function setSessionTrace(newTrace) {
    sessionTrace = newTrace;
  }

  function getSessionTrace() {
    return sessionTrace;
  }

  //return errors in a consistent way
  function handleHttpError(res, cb) {
    var err = {status: res.status, body: res.body};
    return cb(err);
  }
  //assert on the number of args given
  function assertArgumentsSize (argumentsObj, length) {
    if (argumentsObj.length !== length) {
      throw new Error('Expected arguments to be length ' + length + ' but was ' + argumentsObj.length);
    }
  }

  function assertArgumentsSizes (argumentsObj, min, max) {
    if ((argumentsObj.length < min) || (argumentsObj.length > max)) {
      throw new Error(`Expected arguments to be length between ${min} and ${max} but was ${argumentsObj.length}`);
    }
  }

  function makeAPIUrl(path, extra) {
    var result = apihost + path;
    if (extra) {
      result += '/' + extra;
    }
    return result;
  }
  /**
   * Set API host
   *
   * @param newhost Sets the API host to a new value
   */
  function setApiHost(newhost) {
    apihost = newhost;
  }
  /**
   * Set Upload host
   *
   * @param newhost Sets the Upload host to a new value
   */
  function setUploadHost(newhost) {
    uploadhost = newhost;
  }
  /**
   * Get the Upload host
   *
   */
  function getUploadUrl() {
    if (usersToken == null) {
      return null;
    }
    // We previously exposed the user's session id here - which we identified as a security risk.
    // We would have just removed the token query param altogether, but the URl that we direct user's to
    // is configured in a way where the token needs to be set for the Chrome Uploader to be launched
    // So for now we are setting the token to a constant.
    return makeUploadUrl('', { launchUploader: 'true' });
  }
  /**
   * Set Data host
   *
   * @param newhost Sets the Data host to a new value
   */
  function setDataHost(newhost) {
    dataHost = newhost;
  }
  /**
   * Do we have the Data host?
   */
  function hasDataHost() {
    return dataHost !== null;
  }
  /**
   * Set Blip host
   *
   * @param newhost Sets the Blip host to a new value
   */
  function setBlipHost(newhost) {
    bliphost = newhost;
  }

  function makeBlipUrl(path, extra) {
    var result = bliphost + path;
    if (extra) {
      result += '/' + extra;
    }
    return result;
  }

  function makeUploadUrl(path, query) {
    if (uploadhost == null) {
      return null;
    }

    var result = uploadhost + path;
    if (!_.isEmpty(query)) {
      result += '?';
      var fields = [];
      for (var k in query) {
        fields.push(k + '=' + query[k]);
      }
      result += fields.join('&');
    }
    return result;
  }

  function makeDataUrl(path, query) {
    if (dataHost == null) {
      return null;
    }

    var result = dataHost + path;
    if (!_.isEmpty(query)) {
      result += '?';
      var fields = [];
      for (var k in query) {
        fields.push(k + '=' + query[k]);
      }
      result += fields.join('&');
    }
    return result;
  }

  function makeExportUrl(userId, query) {
    if (apihost == null) {
      return null;
    }

    var result = makeAPIUrl('/export', userId);
    if (!_.isEmpty(query)) {
      result += '?';
      var fields = [];
      for (var k in query) {
        fields.push(k + '=' + encodeURIComponent(query[k]));
      }
      result += fields.join('&');
    }
    return result;
  }

  /**
   * Append allowed url paramaters to a url
   *
   * @param {String} url The base url to append the query params to
   * @param {Object} options Object with key-value pairs of params to set
   * @param {[]String} allowedParams Array of allowed query params to set
   *
   * @returns {String} url The url with added query params
   */
  function appendUrlParamsFromOptions(url, options, allowedParams) {
    return _.reduce(allowedParams, function(url, param) {
      if (!_.isUndefined(options[param]) && !_.isNull(options[param])) {
        url += (url.includes('?') ? '&' : '?') + param + '=' + options[param];
      }
      return url;
    }, url);
  }

  function serviceCallChecks(sadCb, happyCb) {
    if ( isLoggedIn() && hasConnection() ) {
      return happyCb(usersToken);
    } else if (! hasConnection() ) {
      return sadCb({status: STATUS_OFFLINE, body: STATUS_OFFLINE_MSG});
    } else if(!isLoggedIn()) {
      return sadCb({status: STATUS_UNAUTHORIZED, body: STATUS_UNAUTHORIZED_MSG});
    }
  }
  /*
   * do a GET with the stored token
   *
   * @param path path to resource
   * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
   *  e.g. { 200: function(res){ return res.body.messages; } }
   * @param cb
   * @returns {cb}  cb(err, response)
   */
   function doGetWithToken(path, codes, cb) {

    if (cb == null && typeof(codes) === 'function') {
      cb = codes;
      codes = {
        200: function(res) { return res.body; }
      };
    }

    /*jshint validthis: true */
    var self = this;

    return self.serviceCallChecks(cb, function(token) {
      superagent
        .get(self.makeAPIUrl(path))
        .set(self.SESSION_TOKEN_HEADER, token)
        .set(self.TRACE_SESSION_HEADER, getSessionTrace())
        .end(
        function (err, res) {
          if (err != null) {
            if (_.has(codes, err.status)) {
              var handler = codes[err.status];
              if (typeof(handler) === 'function') {
                return cb(null, handler(err.response));
              } else {
                return cb(null, handler);
              }
            }
            err.body = (err.response && err.response.body) || '';
            return cb(err);
          }

          if (_.has(codes, res.status)) {
            var handler = codes[res.status];
            if (typeof(handler) === 'function') {
              return cb(null, handler(res));
            } else {
              return cb(null, handler);
            }
          }
          return self.handleHttpError(res, cb);
        });
      });
    }
    /*
     * do a POST with the stored token
     *
     * @param path path to resource
     * @param data to send
     * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
     *  e.g. { 201: function(res){ return res.body.id; } }
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    function doPostWithToken(path, data, codes, cb) {
      if (cb == null && typeof(codes) === 'function') {
        cb = codes;
        codes = {
          200: function(res) { return res.body; }
        };
      }

      /*jshint validthis: true */
      var self = this;

      return self.serviceCallChecks(cb, function(token) {
        superagent
          .post(self.makeAPIUrl(path))
          .send(data)
          .set(self.SESSION_TOKEN_HEADER, token)
          .set(self.TRACE_SESSION_HEADER, getSessionTrace())
          .end(
          function (err, res) {
            if (err != null) {
              if (_.has(codes, err.status)) {
                var handler = codes[err.status];
                if (typeof(handler) === 'function') {
                  return cb(null, handler(err.response));
                } else {
                  return cb(null, handler);
                }
              }
              err.body = (err.response && err.response.body) || '';
              return cb(err);
            }

            if (_.has(codes, res.status)) {
              var handler = codes[res.status];
              if (typeof(handler) === 'function') {
                return cb(null, handler(res));
              } else {
                return cb(null, handler);
              }
            }

            return self.handleHttpError(res, cb);
          });
      });
    }
    /*
     * do a PUT with the stored token
     *
     * @param path path to resource
     * @param data to send
     * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    function doPutWithToken(path, data, codes, cb) {
      if (cb == null && typeof(codes) === 'function') {
        cb = codes;
        codes = {
          200: function(res) { return res.body; }
        };
      }

      /*jshint validthis: true */
      var self = this;

      return self.serviceCallChecks(cb, function(token) {
        superagent
          .put(self.makeAPIUrl(path))
          .send(data)
          .set(self.SESSION_TOKEN_HEADER, token)
          .set(self.TRACE_SESSION_HEADER, getSessionTrace())
          .end(
          function (err, res) {
            if (err != null) {
              if (_.has(codes, err.status)) {
                var handler = codes[err.status];
                if (typeof(handler) === 'function') {
                  return cb(null, handler(err.response));
                } else {
                  return cb(null, handler);
                }
              }
              err.body = (err.response && err.response.body) || '';
              return cb(err);
            }

            if (_.has(codes, res.status)) {
              var handler = codes[res.status];
              if (typeof(handler) === 'function') {
                return cb(null, handler(res));
              } else {
                return cb(null, handler);
              }
            }

            return self.handleHttpError(res, cb);
          });
      });
    }

  return {
    //Constants
    SESSION_TOKEN_HEADER : SESSION_TOKEN_HEADER,
    TRACE_SESSION_HEADER : TRACE_SESSION_HEADER,
    DIGEST_HEADER : DIGEST_HEADER,
    STATUS_BAD_REQUEST : STATUS_BAD_REQUEST,
    STATUS_UNAUTHORIZED : STATUS_UNAUTHORIZED,
    STATUS_UNAUTHORIZED_MSG : STATUS_UNAUTHORIZED_MSG,
    STATUS_OFFLINE : STATUS_OFFLINE,
    STATUS_OFFLINE_MSG : STATUS_OFFLINE_MSG,
    //Tokens
    syncToken : syncToken,
    getToken : getToken,
    setSessionTrace : setSessionTrace,
    getSessionTrace : getSessionTrace,
    //Endpoints
    makeAPIUrl : makeAPIUrl,
    makeUploadUrl : makeUploadUrl,
    makeDataUrl : makeDataUrl,
    makeExportUrl : makeExportUrl,
    makeBlipUrl : makeBlipUrl,
    setBlipHost :  setBlipHost,
    setUploadHost : setUploadHost,
    setDataHost : setDataHost,
    setApiHost : setApiHost,
    getUploadUrl : getUploadUrl,
    hasDataHost: hasDataHost,
    //Utility
    handleHttpError : handleHttpError,
    assertArgumentsSize : assertArgumentsSize,
    assertArgumentsSizes : assertArgumentsSizes,
    serviceCallChecks : serviceCallChecks,
    appendUrlParamsFromOptions : appendUrlParamsFromOptions,
    //Server calls
    doGetWithToken : doGetWithToken,
    doPostWithToken : doPostWithToken,
    doPutWithToken : doPutWithToken
  };
};
