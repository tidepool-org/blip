var bg = function(data, pool) {
  var scale = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.value; })])
    .range([pool.height(), 0]);

  return scale;
};

var carbs = function(data, pool) {
  var scale = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.value; })])
    .range([0.45 * pool.height(), 0]);

  return scale;
};

module.exports.bg = bg;
module.exports.carbs = carbs;