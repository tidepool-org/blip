/* 
 * == BSD2 LICENSE ==
 */

var _ = require('./lib/')._;

var log = require('./lib/').bows('TidelineData');

function TidelineData(data) {

  data = _.map(data, function(d, i) {
    d.index = i;
    return d;
  });

  this.data = data;

  return this;
}

module.exports = TidelineData;