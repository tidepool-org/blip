/** @jsx React.DOM */
var React = window.React;
var bows = window.bows;
var _ = window._;
var config = window.config;

var router = require('./router');
var auth = require('./core/auth');
var api = require('./core/api');
var user = require('./core/user');

var Nav = require('./nav');
var Notification = require('./notification');
var Login = require('./login');
var Logout = require('./logout');
var Profile = require('./profile');

var app = {
  log: bows('App'),
  auth: auth,
  api: api,
  user: user,
  router: router
};

window.app = app;

var routes = {
  '/': 'showProfile',
  '/login': 'showLogin',
  '/profile': 'showProfile'
};

var AppComponent = React.createClass({
  getInitialState: function() {
    return {
      authenticated: app.auth.isAuthenticated(),
      notification: null,
      page: null,
      user: null,
      loggingIn: false,
      loginError: null,
      loggingOut: false,
      loggingOutComplete: false
    };
  },

  componentDidMount: function() {
    if (this.state.authenticated) {
      this.fetchUser();
    }

    this.setupAndStartRouter();
  },

  setupAndStartRouter: function() {
    var self = this;

    var routingTable = {};
    _.forEach(routes, function(handlerName, route) {
      routingTable[route] = self[handlerName];
    });

    var isAuthenticated = function() {
      return self.state.authenticated;
    };

    app.router.setup(routingTable, {isAuthenticated: isAuthenticated});
    app.router.start();
  },

  render: function() {
    var overlay = this.renderOverlay();
    var nav = this.renderNav();
    var notification = this.renderNotification();
    var page = this.renderPage();

    return (
      /* jshint ignore:start */
      <div className="app">
        {overlay}
        {nav}
        {notification}
        {page}
      </div>
      /* jshint ignore:end */
    );
  },

  renderOverlay: function() {
    if (this.state.loggingOut) {
      return (
        /* jshint ignore:start */
        <Logout fadeOut={this.state.loggingOutComplete} />
        /* jshint ignore:end */
      );
    }

    return null;
  },

  renderNav: function() {
    if (this.state.authenticated) {
      /* jshint ignore:start */
      return (
        <Nav
          version={config.VERSION}
          user={this.state.user}
          onLogout={this.logout} />
      );
      /* jshint ignore:end */
    }

    return null;
  },

  renderNotification: function() {
    if (this.state.notification) {
      /* jshint ignore:start */
      return (
        <Notification 
          message={this.state.notification}
          onClose={this.closeNotification} />
      );
      /* jshint ignore:end */
    }

    return null;
  },

  // Override on route change
  renderPage: function() {
    return null;
  },

  showLogin: function() {
    this.renderPage = this.renderLogin;
    this.setState({page: 'login'});
  },

  renderLogin: function() {
    return (
      /* jshint ignore:start */
      <Login 
        loggingIn={this.state.loggingIn}
        onLogin={this.login}
        message={this.state.loginError} />
      /* jshint ignore:end */
    );
  },

  showProfile: function() {
    this.renderPage = this.renderProfile;
    this.setState({page: 'profile'});
  },

  renderProfile: function() {
    return (
      /* jshint ignore:start */
      <Profile 
          user={this.state.user}
          onValidate={this.validateUser}
          onSave={this.updateUser}/>
      /* jshint ignore:end */
    );
  },

  login: function() {
    var self = this;

    if (this.state.loggingIn) {
      return;
    }

    this.setState({loggingIn: true});

    app.auth.login(function(err) {
      if (err) {
        self.setState({
          loggingIn: false,
          loginError: err.message || 'An error occured while logging in.'
        });
        return;
      }
      self.setState({
        authenticated: true,
        loggingIn: false
      });
      self.fetchUser();
      router.setRoute('/profile');
    });
  },

  logout: function() {
    var self = this;

    if (this.state.loggingOut) {
      return;
    }

    this.setState({
      loggingOut: true,
      loggingOutComplete: false
    });

    app.auth.logout(function(err) {
      if (err) {
        self.setState({
          loggingOut: false,
          notification: err.message || 'An error occured while logging out.'
        });
        return;
      }
      self.setState({
        authenticated: false,
        loggingOutComplete: true
      });
      self.clearUserData();

      // Fade out overlay
      setTimeout(function() {
        self.setState({loggingOut: false});
      }, 200);

      router.setRoute('/login');
    });
  },

  closeNotification: function() {
    this.setState({notification: null});
  },

  fetchUser: function() {
    var self = this;

    app.api.user.get(function(err, user) {
      self.setState({user: user});
    });
  },

  clearUserData: function() {
    this.setState({
      user: null
    });
  },

  validateUser: function(user) {
    return app.user.validate(user);
  },

  updateUser: function(user) {
    var self = this;
    var previousUser = this.state.user;

    // Optimistic update
    self.setState({user: user});

    app.api.user.put(user, function(err, user) {
      if (err) {
        self.setState({
          notification: err.message || 'An error occured while saving user.'
        });
        // Rollback
        self.setState({user: previousUser});
        return;
      }
      self.setState({user: user});
    });
  }
});

app.start = function() {
  var self = this;

  this.init(function() {
    self.component = React.renderComponent(
      /* jshint ignore:start */
      <AppComponent />,
      /* jshint ignore:end */
      document.getElementById('app')
    );

    self.log('App started');
  });
};

app.init = function(callback) {
  var self = this;

  function initApi() {
    self.api.init();
    initAuth();
  }

  function initAuth() {
    self.auth.init(callback);
  }

  initApi();
};

module.exports = app;