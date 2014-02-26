window.tidepoolPlatform = function(host, api, auth){
  var log = bows('tidepoolplatform');

  var sessionTokenHeader = 'x-tidepool-session-token';
  var token = null;
  var userid = null;

  function makeUrl(path) {
    return host + path;
  }

  function setupUser(api) {
    api.get = function(cb) {
      if (token == null || userid == null) {
        cb({ message: 'Not logged in' });
      }

      app.api.patient.get(userid, cb);
    };

    api.put = function(user, cb) {
      if (token == null || userid == null) {
        cb({ message: 'Not logged in' });
      }

      app.api.patient.put(userid, user, cb);
    };

    api.getToken = function() {
      return token;
    };

    api.getUserid = function() {
      return userid;
    };
  }

  function setupPatient(api) {
    api.getAll = function(cb) {
      if (token == null || userid == null) {
        cb({ message: 'Not logged in' });
      }

      superagent.get(makeUrl('/metadata/' + userid + '/groups'))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res){
          if (err != null) {
            return cb(err);
          }

          if (res.status !== 200) {
            return cb({ message: 'Unknown response code from metadata ' + res.status });
          } else {
            if (res.body == null || res.body.patients == null) {
              return cb(null, []);
            }

            var patientsGroup = res.body.patients;
            superagent.get(makeUrl('/groups/' + patientsGroup + '/members'))
              .set(sessionTokenHeader)
              .end(
              function(membersErr, membersResult){
                if (membersErr != null) {
                  return cb(membersErr);
                }

                if (membersResult.status === 200) {
                  return cb(null, membersResult.body.groups);
                }
                else {
                  return cb({ message: 'Unknown response code from groups ' + res.status });
                }
              });
          }
        });
    };

    api.get = function(patientId, cb) {
      if (token == null || userid == null) {
        cb({ message: 'Not logged in' });
      }

      superagent.get(makeUrl('/metadata/' + patientId + '/profile'))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res){
          if (err != null) {
            return cb(err);
          }

          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(null, null);
          }
        });
    };

    api.put = function(patientId, patient, cb) {
      superagent.post(makeUrl('/metadata/' + patientId + '/profile'))
        .set(sessionTokenHeader, token)
        .send(patient)
        .end(
        function(err, res){
          if (err != null) {
            return cb(err);
          }

          if (res.status === 200) {
            return cb(null, res.body);
          } else {
            return cb({ message: 'Couldn\'t POST new user metadata: ' + res.status });
          }
        });
    };
  }

  function setupAuth(api) {
    function saveSession(newUserid, newToken) {
      token = newToken;
      userid = newUserid;
      if (newToken != null) {
        setTimeout(
          function(){
            if (token == null || newUserid !== userid) {
              return;
            }

            superagent.get(makeUrl('/auth/login'))
              .set(sessionTokenHeader, token)
              .end(
              function(err, res){
                if (err) {
                  log(err);
                  return;
                }

                if (res.status === 200) {
                  saveSession(newUserid, res.headers[sessionTokenHeader]);
                } else {
                  log('Unknown response when refreshing token' + res.status);
                }
              });
          },
          10 * 60 * 1000
        );
      }
    }


    api.init = function(cb) { return cb(); };

    api.login = function(user, cb) {
      if (user.username == null) {
        return cb({ message: 'Must specify an username' });
      }
      if (user.password == null) {
        return cb({ message: 'Must specify a password' });
      }

      superagent.post(makeUrl('/auth/login'))
        .auth(user.username, user.password)
        .end(
        function(err, res) {
          if (err != null) {
            return cb(err);
          }

          if (res.status === 200) {
            saveSession(res.body.userid, res.headers[sessionTokenHeader]);
            cb(null, res.body);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    };

    api.logout = function(cb) {
      if (token == null) {
        cb(null);
      }

      var oldToken = token;
      saveSession(null, null);
      superagent.post(makeUrl('/auth/logout'))
        .set(sessionTokenHeader, oldToken)
        .end(function(err, res){ cb(err); });
    };

    api.signup = function(user, cb) {
      if (user.username == null) {
        return cb({ message: 'Must specify a username' });
      }
      if (user.password == null) {
        return cb({ message: 'Must specify a password' });
      }

      var userApiUser = _.assign({}, _.pick(user, 'username', 'password'), { emails: [user.username] });
      superagent.post(makeUrl('/auth/user'))
        .send(userApiUser)
        .end(
        function(err, res){
          if (err != null) {
            return cb(err);
          }

          if (res.status === 201) {
            var userApiBody = res.body;
            saveSession(userApiBody.userid, res.headers[sessionTokenHeader]);
            app.api.user.put(_.omit(user, 'username', 'password', 'email'), function(err, profile){
              if (err != null) {
                return cb(err);
              }

              return cb(null, _.assign({}, userApiBody, profile));
            });
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown response code ' + res.status });
          }
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

      superagent.get(makeUrl('/data/' + patientId))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res){
          if (err != null) {
            return cb(err);
          }

          if (res.status === 200) {
            // Rename _id to id in order to work around the fact that we do not have a proper id field in
            // the database yet.  Eventually, we will attach ids to events in the db.  At that point, this
            // mapping can be removed.
            var retVal = res.body.map(function(e){
              if (e['id'] === undefined) {
                e['id'] = e._id;
              }
              e.value = Number(e.value);
              return e;
            });

            cb(null, retVal);
          } else {
            cb(null, null);
          }
        });
    };
  }

  setupUser(api.user);
  setupPatient(api.patient);
  setupAuth(auth);
  setupPatientData(api.patientData);
};