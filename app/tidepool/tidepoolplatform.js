var dataHelpers = require('./data/datahelpers.js');

module.exports = function(options){
  var _ = window._;
  var superagent = window.superagent;
  var bows = window.bows;
  var Rx = window.Rx;

  var apiHost = options.apiHost;
  var uploadApi = options.uploadApi;

  var api = {
    patientData: {}
  };

  var log = bows('Tidepool');

  var sessionTokenHeader = 'x-tidepool-session-token';
  var token = null;
  var userid = null;

  function makeUrl(path) {
    return apiHost + path;
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
            window.inData = res.body;
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
                        units: datum.payload.carbUnits,
                        deviceId: datum.deviceId,
                        annotations: [{ code: 'generated-from-wizard' }].concat(datum.annotations || [])
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
                window.theData = data;
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
