var Router = window.Router;
var bows = window.bows;
var _ = window._;

var router = new Router();

router.log = bows('Router');

var configuration = {
  before: function() {
    var routeBase = router.getRoute(0);
    var isAuthenticated = router.isAuthenticated();
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

router.configure(configuration);

router.setup = function(routes, options) {
  var self = this;

  this.isAuthenticated = options.isAuthenticated ||
                         function() { return true; };
  
  _.forEach(routes, function(handler, route) {
    self.on(route, handler);
  });

  return this;
};

router.start = function() {
  this.init('/');
  this.fireInitialRoute();
  this.log('Router started');
};

// Inspired by:
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