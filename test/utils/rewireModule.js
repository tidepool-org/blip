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

    console.log('boo', rewiredModule.__get__('Header'));
  });

  afterEach(function() {
    rewiredReverts.forEach(function(revert) {
      revert();
    });
  });

  return rewiredModule;
};

module.exports = rewireModule;