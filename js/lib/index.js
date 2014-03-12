var lib = {};

if (typeof window !== 'undefined') {
  lib._ = window._;
  lib.d3 = window.d3;
  // only care about not having d3 when running in the browser
  if (!lib.d3) {
    throw new Error('d3.js is a required dependency');
  }
  lib.Duration = window.Duration;
  // only care about not having Duration when running in the browser
  if (!lib.Duration) {
    throw new Error('Duration.js is a required dependency');
  }
  lib.bows = window.bows;
}
else {
  lib._ = require('lodash');
}

if (!lib._) {
  throw new Error('Underscore or Lodash is a required dependency');
}

if (!lib.bows) {
  // Optional dependency
  // Return a factory for a log function that does nothing
  lib.bows = function() {
    return function() {};
  };
}

module.exports = lib;