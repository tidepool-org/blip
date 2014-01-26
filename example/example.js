d3.json('device-data.json', function(data) {
  var container = require('../js/container')();

  // set up main one-day container
  container.data(data).defaults().width(1000).height(700);

  d3.select('#tidelineContainer').datum(container.getData()).call(container);

  // set up click-and-drag and scroll navigation
  container.setNav().setScrollNav();

  // attach click handlers to set up programmatic pan
  $('#tidelineNavForward').on('click', container.panForward);
  $('#tidelineNavBack').on('click', container.panBack);

  console.log(new Date(container.endpoints[0]), new Date(container.endpoints[1]));

  // start setting up pools
  // blood glucose data pool
  var poolBG = container.newPool().defaults()
    .id('poolBG')
    .label('Blood Glucose')
    .index(container.pools().indexOf(poolBG))
    .weight(1.5);

  container.arrangePools();

  // add background fill rectangles to BG pool
  poolBG.addPlotType('fill', require('../js/plot/fill')(poolBG, {endpoints: container.endpoints}));

  // add CBG data to BG pool
  poolBG.addPlotType('cbg', require('../js/plot/cbg')(poolBG));

  var poolGroup = d3.select('#tidelinePools');

  // render BG pool
  poolBG(poolGroup, container.getData(container.initialEndpoints, 'both'));
});