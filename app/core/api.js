var $ = window.$;
var bows = window.bows;
var config = window.config;

var api = {
  log: bows('Api'),

  init: function() {
    if (config.DEMO) {
      addDemoOverrides(this);
    }
  },

  user: {}
};

// ---------- BEGIN DEMO OVERRIDES ----------
function addDemoOverrides(api) {
  api.demoEndpoint = 'demo';

  // ----- User -----

  api.user.get = function(callback) {
    var uri = '/user.json';
    api.log('[demo] GET ' + uri);
    setTimeout(function() {
      api._get(uri, callback);
    }, config.DEMO_DELAY || 0);
  };

  api.user.put = function(user, callback) {
    var uri = '/user.json';
    api.log('[demo] PUT ' + uri);
    setTimeout(function() {
      var err;
      // err = true;
      callback(err, user);
    }, config.DEMO_DELAY || 0);
  };

  // ----- Private methods -----

  api._url = function(uri) {
    var url = this.demoEndpoint + (uri || '');
    return url;
  };

  api._get = function(uri, callback) {
    var url = this._url(uri);

    $.getJSON(url, function(data) {
      callback(null, data);
    }).error(function(error) {
      callback(error);
    });
  };

  return api;
}
// ---------- END DEMO OVERRIDES ----------

module.exports = api;