function makeValidator() {
  if (arguments.length == 1) {
    var element = arguments[0];
    switch (typeof(element)) {
      case 'function':
        return element;
        break;
      case 'object':
        if (Array.isArray(element)) {
          var fns = new Array(element.length);
          for (var i = 0; i < element.length; ++i) {
            fns[i] = makeValidator(element[i]);
          }

          return function(e) {
            for (var i = 0; i < fns.length; ++i) {
              fns[i](e);
            }
          };
        } else {
          return makeValidator(Object.keys(element).map(function(key){
            var fn = makeValidator(element[key]);

            return function(e) {
              try {
                fn(e[key]);
              } catch (e) {
                e.message = '.' + key + e.message;
                throw e;
              }
            }
          }));
        }
        break;
      default:
        if (Array.isArray(element)) {
        } else {
          console.log('makeValidator given', element);
          throw new Error('makeValidator must be given an Object, function, or array');
        }
    }
  } else {
    return makeValidator(Array.prototype.slice.call(arguments, 0));
  }
}

exports.makeValidator = makeValidator;