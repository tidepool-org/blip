var Router = window.Router;
var bows = window.bows;
var _ = window._;
/* global app */

var router;

var configuration = {
  before: function() {
    var routeBase = router.getRoute(0);
    var isAuthenticated = app.component.state.authenticated;
    var isNoAuthRoute = _.contains(['login'], routeBase);

    if (router.ignoreFirstRoute) {
      router.ignoreFirstRoute = false;
      return false;
    }

    if (!isAuthenticated && !isNoAuthRoute) {
      router.log('Not logged in, redirecting');
      router.setRoute('login');
      // Stop current routing and let new routing take over
      return false;
    }

    if (isAuthenticated && isNoAuthRoute) {
      router.log('Already logged in, redirecting');
      router.setRoute('profile');
      return false;
    }
  },

  on: function() {
    var route = router.getRoute();
    router.log('Route /' + route);
  }
};

var routes = {
  '/': index,
  '/login': login,
  '/profile': profile
};

function index() {
  // Default logged-in route
  router.setRoute('/profile');
}

function login() {
  setContent('login');
}

function profile() {
  setContent('profile');
}

function setContent(content) {
  app.component.setState({content: 'profile'});
}

router = new Router(routes);
router.configure(configuration);

router.log = bows('Router');

router.start = function() {
  this.init('/');
  this.fireInitialRoute();
  this.log('Router started');
};

// https://github.com/flatiron/director/issues/199
router.fireInitialRoute = function() {
  var initialRoute = window.location.hash.replace(/^#/, '');
  if (initialRoute !== '/') {
    this.ignoreFirstRoute = true;
    this.setRoute('/');
  }
  this.setRoute(initialRoute);
  if (!location.hash.replace(/^#\/*/, '') && (history && history.pushState)) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
};

module.exports = router;