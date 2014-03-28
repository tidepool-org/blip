var dataHelpers = require('./data/datahelpers.js');

module.exports = function(options){
  var _ = window._;
  var superagent = window.superagent;
  var bows = window.bows;
  var Rx = window.Rx;

  var apiHost = options.apiHost;
  var uploadApi = options.uploadApi;

  var api = {
    user: {},
    patient: {},
    patientData: {}
  };

  var log = bows('Tidepool');

  var sessionTokenHeader = 'x-tidepool-session-token';
  var token = null;
  var userid = null;

  var PATIENT_GETALL_NOT_IMPLEMENTED = true;

  function makeUrl(path) {
    return apiHost + path;
  }

  function setupUser(api) {
    api.get = function(cb) {
      if (token == null || userid == null) {
        return cb({ message: 'Not logged in' });
      }

      // First fetch user account data (username)
      var uri = '/auth/user';
      log('GET ' + uri);
      superagent.get(makeUrl(uri))
        .set(sessionTokenHeader, token)
        .end(function(err, res) {
          if (err != null) {
            return cb(err);
          }

          if (res.status !== 200) {
            return cb({status: res.status, response: res.body});
          }

          var user = res.body;
          // Then fetch user profile information (first name, last name, etc.)
          uri = '/metadata/' + userid + '/profile';
          log('GET ' + uri);
          superagent.get(makeUrl(uri))
            .set(sessionTokenHeader, token)
            .end(function(err, res) {
              if (err != null) {
                return cb(err);
              }

              if (res.status !== 200) {
                return cb({status: res.status, response: res.body});
              }

              var data = res.body;
              data.id = userid;
              data.username = user.username;
              // If user profile has patient data, just give the "patient id"
              // (which is the same as the userid for this backend)
              if (data.patient != null) {
                data.patient = {id: userid};
              }
              cb(null, data);
            });
        });
    };

    api.put = function(user, cb) {
      if (token == null || userid == null) {
        return cb({ message: 'Not logged in' });
      }

      // NOTE: Current backend does not yet support changing
      // username or password, only profile info
      var profile = _.omit(user, 'username', 'password');
      var uri = '/metadata/' + userid + '/profile';
      log('POST ' + uri);
      superagent.post(makeUrl(uri))
        .set(sessionTokenHeader, token)
        .send(profile)
        .end(function(err, res) {
          if (err != null) {
            return cb(err);
          }

          if (res.status !== 200) {
            return cb({status: res.status, response: res.body});
          }

          var data = res.body;
          data.id = userid;
          data.username = user.username;
          // If user profile has patient data, just give the "patient id"
          // (which is the same as the userid for this backend)
          if (data.patient != null) {
            data.patient = {id: userid};
          }
          cb(null, data);
        });
    };
  }

  function setupPatientData(api) {
    api.get = function(patientId, options, cb) {
      if (token == null || userid == null) {
        return cb({ message: 'Not logged in' });
      }

      if (typeof options === 'function') {
        cb = options;
      }

      var uri = '/data/' + patientId;
      log('GET ' + uri);
      superagent.get(makeUrl(uri))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res){
          if (err != null) {
            return cb(err);
          }

          if (res.status === 200) {
            Rx.Observable.fromArray(res.body)
              .tidepoolConvertBasal()
              .tidepoolConvertBolus()
              .flatMap(function(datum) {
                if (datum.type === 'wizard') {
                  return Rx.Observable.fromArray(
                    [ datum,
                      { _id: datum._id + 'carbs',
                        type: 'carbs',
                        deviceTime: datum.deviceTime,
                        value: datum.payload.carbInput,
                        units: datum.payload.carbUnits
                      }
                    ]
                  );
                } else {
                  return Rx.Observable.return(datum);
                }
              })
              .toArray()
              .subscribe(
              function(data) {
                cb(null, data);
              },
              cb
            );
          } else {
            cb(null, null);
          }
        });
    };
  }

  function setupUpload(api) {
    api.getUploadUrl = function() {
      if (token == null) {
        return null;
      }
      return uploadApi + '?token=' + token;
    };
  }

  setupUser(api.user);
  setupPatientData(api.patientData);
  setupUpload(api);

  api.getToken = function() {
    return token;
  };

  api.setToken = function(newToken) {
    token = newToken;
    return api;
  };

  api.getUserId = function() {
    return userid;
  };

  api.setUserId = function(newUserId) {
    userid = newUserId;
    return api;
  };

  return api;
};
