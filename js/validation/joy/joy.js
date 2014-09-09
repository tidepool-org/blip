var util = require('util');

var validator = require('./validator.js');

function error() {
  arguments[0] = ' ' + arguments[0];
  throw new Error(util.format.apply(util, Array.prototype.slice.call(arguments, 0)));
}

function matchesRegex(regex) {
  return function(v) {
    if (!regex.test(v)) {
      error('should match the regex[%s], got[%s]', regex, v);
    }
  };
}

function typeOf(match) {
  return function(e) {
    if (typeof(e) !== match) {
      error('should be of type[%s], value was [%s]', match, e);
    }
  };
}

var isAnId = matchesRegex(/^[A-Za-z0-9\-\_]+$/);
// deviceTime is the raw, non-timezone-aware string
var isADeviceTime = matchesRegex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
var isoPattern = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/;


module.exports = function() {
  if (arguments.length > 0) {
    return validator.makeValidator.apply(validator, Array.prototype.slice.call(arguments, 0));
  }

  var optional = false;
  var fns = [];

  return _.assign(
    function(e) {
      if (optional && e == null) {
        return;
      }

      for (var i = 0; i < fns.length; ++i) {
        fns[i](e);
      }
    },
    {
      array: function(fn) {
        fns.push(function(e){
          if (!Array.isArray(e)) {
            error('should be an array, value was [%s]', e);
          }

          for (var i = 0; i < e.length; ++i) {
            fn(e[i]);
          }
        });

        return this;
      },

      boolean: function() {
        fns.push(typeOf('boolean'));

        return this;
      },

      ifExists: function () {
        optional = true;
        return this;
      },

      in: function (vals) {
        var obj = {};
        for (var i = 0; i < vals.length; ++i) {
          obj[vals[i]] = true;
        }

        fns.push(function (e) {
          if (obj[e] == null) {
            error('should be one of%j, got[%s]', vals, e);
          }
        });
        return this;
      },

      isDeviceTime: function () {
        fns.push(isADeviceTime);
        return this;
      },


      isId: function () {
        fns.push(isAnId);
        return this;
      },


      isISODateTime: function () {
        fns.push(function (value) {
          if (!isoPattern.test(value)) {
            error('is not an ISODate string, got[%s]', value);
          }
        });
        return this;
      },

      minLength: function(length) {
        fns.push(function(e) {
          if (e.length < length) {
            error('should have a length >= [%s], got[%s]', length, e);
          }
        });
        return this;
      },

      max: function (val) {
        fns.push(function (e) {
          if (e > val) {
            error('should be <= [%s], got [%s]', val, e);
          }
        });
        return this;
      },

      min: function (val) {
        fns.push(function (e) {
          if (e < val) {
            error('should be >= [%s], got [%s]', val, e);
          }
        });
        return this;
      },

      number: function () {
        fns.push(isFinite);
        return this;
      },

      object: function() {
        fns.push(typeOf('object'));
        if (arguments.length > 0) {
          fns.push(module.exports(arguments[0]));
        }

        return this;
      },

      regex: function(regex) {
        fns.push(matchesRegex(regex));
        return this;
      },

      string: function() {
        fns.push(typeOf('string'));
        return this;
      }
    }
  );
};

module.exports.and = function(fields) {
  return function(e){
    var allNull = true;
    var allNotNull = true;
    for (var i = 0; i < fields.length; ++i) {
      if (e[fields[i]] == null) {
        allNotNull = false
      } else {
        allNull = false;
      }
    }

    if (! (allNull || allNotNull)) {
      error('Fields%j are all or nothing, values were %j', fields, _.pick(e, fields));
    }
  };
};

module.exports.with = function(primaryField, fields) {
  if (! Array.isArray(fields)) {
    fields = [fields];
  }

  return function(e){
    if (e[primaryField] != null) {
      for (var i = 0; i < fields.length; ++i) {
        if (e[fields[i]] == null) {
          error('Fields%j are expected when field[%s] exists.  Values were %j', fields, primaryField, _.pick(e, primaryField, fields));
        }
      }
    }
  };
};

module.exports.error = error;

