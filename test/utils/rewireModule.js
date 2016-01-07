/* global beforeEach */
/* global afterEach */

var rewireModule = function rewireModule(rewiredModule, varValues) {
  var rewiredReverts = [];

  beforeEach(function() {
    var key, value, revert;
    for (key in varValues) {
      if (varValues.hasOwnProperty(key)) {
        value = varValues[key];
        revert = rewiredModule.__set__(key, value);
        rewiredReverts.push(revert);
      }
    }
  });

  afterEach(function() {
    rewiredReverts.forEach(function(revert) {
      revert();
    });
  });

  return rewiredModule;
};

module.exports = rewireModule;