var container = require('./container');
var data = require('./data');

var d = data();

var initialEndpoints = [new Date(2014, 0, 1, 0, 0, 0, 0), new Date(2014, 0, 2, 0, 0, 0, 0)];

var container = container(d(initialEndpoints));

var s = new Date(initialEndpoints[0]), e = new Date(initialEndpoints[1]);

var onDeckLeft = [s.setDate(s.getDate() - 1), e.setDate(e.getDate() - 1)];
var onDeckRight = [s.setDate(s.getDate() + 2), e.setDate(e.getDate() + 2)];

d3.select('#tidelineContainer').call(container);

var mainGroup = d3.select('#tidelineMain');

for (j = 0; j < 6; j++) {
  var pool = container.newPool();
  pool.id('pool_' + j).yPosition((j * 80) + 60).xScale(container.updateXScale().copy());
  pool(mainGroup, initialEndpoints);
  pool(mainGroup, onDeckLeft);
  pool(mainGroup, onDeckRight);
}
container.beginningOfData(onDeckLeft[0]);
container.endOfData(onDeckRight[1]);
