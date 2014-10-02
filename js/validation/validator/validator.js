/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * 
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

function makeValidator() {
  if (arguments.length === 1) {
    var element = arguments[0];
    switch (typeof(element)) {
      case 'function':
        return element;
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
            };
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