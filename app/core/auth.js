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
    demoUsername: 'demo',
    demoPassword: 'demo',

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
        setTimeout(callback, config.DEMO_DELAY);
      }
      else {
        setTimeout(callback, config.DEMO_DELAY);
      }
      this.log('[demo] Session loaded');
    },

    saveSession: function(token, options) {
      options = options || {};
      
      this.token = token;
      if (options.remember) {
        var localStorage = window.localStorage;
        if (localStorage && localStorage.setItem) {
          localStorage.setItem('demoAuthToken', token);
        }
      }
    },

    destroySession: function() {
      this.token = null;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.removeItem) {
        localStorage.removeItem('demoAuthToken');
      }
    },

    login: function(username, password, options, callback) {
      var self = this;

      // Allow to not pass options object
      if (typeof options === 'function') {
        callback = options;
      }

      setTimeout(function() {
        var err;
        if (username !== self.demoUsername || password !== self.demoPassword) {
          err = {message: 'Wrong username or password.'};
        }
        if (!err) {
          self.saveSession(self.demoToken, options);
          self.log('[demo] Login success');
        }
        else {
          self.log('[demo] Login failed');
        }
        callback(err);
      }, config.DEMO_DELAY);
    },

    logout: function(callback) {
      var self = this;
      setTimeout(function() {
        var err;
        if (config.DEMO_VARIANT === 'auth.logout.error') {
          err = {message: 'Logout failed, please try again.'};
        }
        if (!err) {
          self.destroySession();
          self.log('[demo] Logout success');
        }
        else {
          self.log('[demo] Logout failed');
        }
        callback(err);
      }, config.DEMO_DELAY);
    },

    signup: function(user, callback) {
      var self = this;

      user.id = '1';
      delete user.password;

      setTimeout(function() {
        var err;
        if (config.DEMO_VARIANT === 'auth.signup.error') {
          err = {message: 'An account already exists for that username.'};
        }
        if (!err) {
          self.saveSession(self.demoToken);
          self.log('[demo] Signup success');
        }
        else {
          self.log('[demo] Signup failed');
        }
        callback(err, user);
      }, config.DEMO_DELAY);
    }

  });

  return auth;
}
// ---------- END DEMO OVERRIDES ----------

module.exports = auth;