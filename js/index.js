var container = require('./container');
var data = require('./data');

var d = data();

var initial_endpoints = [new Date(2014, 0, 1, 0, 0, 0, 0), new Date(2014, 0, 3, 0, 0, 0, 0)];

var container = container(d(initial_endpoints));

d3.select('#timeline-container').call(container);

var mainGroup = d3.select('#mainGroup');

for (j = 0; j < 6; j++) {
  var pool = container.newPool();
  pool.id('pool_' + j).yPosition((j * 80) + 60).xScale(container.xScale.copy());
  pool(mainGroup, initial_endpoints);
}