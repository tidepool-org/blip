var _ = window._;
var bows = window.bows;
var config = window.config;

var auth = {
  token: null,
  log: bows('Auth'),

  init: function(callback) {
    if (config.DEMO) {
      addDemoOverrides(this);
      return this.demoInit(callback);
    }
    callback();
  },

  isAuthenticated: function() {
    return Boolean(this.token);
  }
};

// ---------- BEGIN DEMO OVERRIDES ----------
function addDemoOverrides(auth) {
  _.extend(auth, {
    demoToken: '123',

    // Required method
    demoInit: function(callback) {
      var self = this;

      this.loadSession(function() {
        self.log('[demo] Auth initialized');
        callback();
      });
    },

    loadSession: function(callback) {
      var token;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.getItem) {
        token = localStorage.getItem('demoAuthToken');
        if (token) {
          this.saveSession(token);
        }
        setTimeout(callback, config.DEMO_DELAY || 0);
      }
      else {
        setTimeout(callback, config.DEMO_DELAY || 0);
      }
      this.log('[demo] Session loaded');
    },

    saveSession: function(token) {
      this.token = token;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.setItem) {
        localStorage.setItem('demoAuthToken', token);
      }
    },

    destroySession: function() {
      this.token = null;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.removeItem) {
        localStorage.removeItem('demoAuthToken');
      }
    },

    login: function(callback) {
      var self = this;
      setTimeout(function() {
        var err;
        // err = {message: 'Wrong username or password.'};
        if (!err) {
          self.saveSession(self.demoToken);
          self.log('[demo] Login success');
        }
        else {
          self.log('[demo] Login failed');
        }
        callback(err);
      }, config.DEMO_DELAY || 0);
    },

    logout: function(callback) {
      var self = this;
      setTimeout(function() {
        var err;
        // err = {message: 'Logout failed, please try again.'};
        if (!err) {
          self.destroySession();
          self.log('[demo] Logout success');
        }
        else {
          self.log('[demo] Logout failed');
        }
        callback(err);
      }, config.DEMO_DELAY || 0);
    }

  });

  return auth;
}
// ---------- END DEMO OVERRIDES ----------

module.exports = auth;