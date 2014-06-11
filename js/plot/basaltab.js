/* 
 * == BSD2 LICENSE ==
 */

var d3 = require('../lib/').d3;
var _ = require('../lib/')._;

var format = require('../data/util/format');
var log = require('../lib/').bows('Basal');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {};

  opts = _.defaults(opts, defaults);

  var mainGroup = pool.parent();

  function basaltab(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
    });
  }

  return basaltab;
};