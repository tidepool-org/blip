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

module.exports = function (config, deps) {

  var superagent = _.clone(deps.superagent);
  var config = _.clone(config);

  var usersToken;

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

  return {
    //constants
    SESSION_TOKEN_HEADER : 'x-tidepool-session-token',
    STATUS_BAD_REQUEST : 400,
    STATUS_UNAUTHORIZED : 401,
    STATUS_UNAUTHORIZED_MSG: 'User is not logged in, you must log in to do this operation',
    STATUS_OFFLINE: 503,
    STATUS_OFFLINE_MSG : 'User appears to be offline',
    syncToken: function(newToken) {
      usersToken = newToken;
    },
    getToken: function() {
      return usersToken;
    },
    //return errors in a consistent way
    handleHttpError: function(res, cb) {
      var err = {status: res.status, body: res.body};
      return cb(err);
    },
    //assert on the number of args given
    assertArgumentsSize : function(argumentsObj, length) {
      if (argumentsObj.length !== length) {
        throw new Error('Expected arguments to be length ' + length + ' but was ' + argumentsObj.length);
      }
    },
    makeUrl : function(path, extra) {
      var result = config.host + path;
      if (extra) {
        result += '/' + extra;
      }
      return result;
    },
    serviceCallChecks: function(sadCb, happyCb) {
      if ( isLoggedIn() && hasConnection() ) {
        return happyCb(usersToken);
      } else if (! hasConnection() ) {
        return sadCb({status: STATUS_OFFLINE, body: STATUS_OFFLINE_MSG});
      } else if(!isLoggedIn()) {
        return sadCb({status: STATUS_UNAUTHORIZED, body: STATUS_UNAUTHORIZED_MSG});
      }
    },
    /*
   * do a GET with the stored token
   *
   * @param path path to resource
   * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
   *  e.g. { 200: function(res){ return res.body.messages; } }
   * @param cb
   * @returns {cb}  cb(err, response)
   */
   doGetWithToken : function(path, codes, cb) {
    //if the cb is not defined and the codes param is a function then set that
    //to be the cb
    if (cb == null && typeof(codes) === 'function') {
      cb = codes;
      codes = {
        200: function(res) { return res.body; }
      };
    }

    var self = this;

    return self.serviceCallChecks(cb, function(token) {
      superagent
        .get(self.makeUrl(path))
        .set(self.SESSION_TOKEN_HEADER, token)
        .end(
        function (err, res) {
          if (err != null) {
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
    },
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
    doPostWithToken:function(path, data, codes, cb) {
      if (cb == null && typeof(codes) === 'function') {
        cb = codes;
        codes = {
          200: function(res) { return res.body; }
        };
      }

      var self = this;

      return self.serviceCallChecks(cb, function(token) {
        superagent
          .post(self.makeUrl(path))
          .send(data)
          .set(self.SESSION_TOKEN_HEADER, token)
          .end(
          function (err, res) {
            if (err != null) {
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
    },
    /*
     * do a PUT with the stored token
     *
     * @param path path to resource
     * @param data to send
     * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    doPutWithToken : function(path, data, codes, cb) {
      if (cb == null && typeof(codes) === 'function') {
        cb = codes;
        codes = {
          200: function(res) { return res.body; }
        };
      }

      var self = this;

      return self.serviceCallChecks(cb, function(token) {
        superagent
          .put(self.makeUrl(path))
          .send(data)
          .set(self.SESSION_TOKEN_HEADER, token)
          .end(
          function (err, res) {
            if (err != null) {
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
  }
}