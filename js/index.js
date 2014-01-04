var container = require('./container');

var d = new Date(2013, 11, 31, 23, 55, 0, 0);

var readings = [];

for (var i = 0; i < 576; i++) {
  readings.push({
    value: Math.floor((Math.random() * 360) + 41),
    timestamp: d.setMinutes(d.getMinutes() + 5)
  });
}

var container = container();

d3.select('#timeline-container').datum(readings).call(container);

for (j = 0; j < 6; j++) {
  var pool = container.newPool();
  pool.id('pool_' + j).yPosition((j * 80) + 10);
  d3.select('#mainGroup').call(pool);
}