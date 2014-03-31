/* 
 * == BSD2 LICENSE ==
 */

var crossfilter = require('../../lib/').crossfilter;

var log = require('../../lib/').bows('TidelineCrossFilter');

function TidelineCrossFilter(data) {

  this.addDimension = function(key) {
    // define some common dimension accessors for tideline, so we don't have to keep writing the same ones
    var accessor;
    switch(key) {
    case 'date':
      accessor = function(d) { return new Date(d.normalTime).valueOf(); };
    }

    return this.cf.dimension(accessor);
  };

  this.getAll = function(dimension, ascending) {
    // default return ascending sort array
    if (!ascending) {
      return dimension.top(Infinity);
    }
    return dimension.top(Infinity).reverse();
  };

  this.getOne = function(dimension) {
    var res = dimension.top(Infinity);

    if (res.length > 1) {
      return undefined;
    }
    else {
      return res[0];
    }
  };

  this.cf = crossfilter(data);

  return this;
}

module.exports = TidelineCrossFilter;