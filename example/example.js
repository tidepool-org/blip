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
  // messages pool
  var poolMessages = container.newPool().defaults()
    .id('poolMessages')
    .label('')
    .index(container.pools().indexOf(poolMessages))
    .weight(0.5);

  // blood glucose data pool
  var poolBG = container.newPool().defaults()
    .id('poolBG')
    .label('Blood Glucose')
    .index(container.pools().indexOf(poolBG))
    .weight(1.5);

  // carbs and boluses data pool
  var poolBolus = container.newPool().defaults()
    .id('poolBolus')
    .label('Bolus & Carbohydrates')
    .index(container.pools().indexOf(poolBolus))
    .weight(1.0);
  
  // basal data pool
  var poolBasal = container.newPool().defaults()
    .id('poolBasal')
    .label('Basal Rates')
    .index(container.pools().indexOf(poolBasal))
    .weight(1.0);

  container.arrangePools();

  var fill = require('../js/plot/fill');

  var scales = require('../js/plot/scales');

  // BG pool
  // set up y-axis
  poolBG.yAxis(d3.svg.axis()
    .scale(scales.bg(_.where(data, {'type':'cbg'}), poolBG))
    .orient('left')
    .outerTickSize(0)
    .tickValues([40, 80, 120, 180, 300]));
  // add background fill rectangles to BG pool
  poolBG.addPlotType('fill', fill(poolBG, {endpoints: container.endpoints}));

  // add CBG data to BG pool
  poolBG.addPlotType('cbg', require('../js/plot/cbg')(poolBG));

  // add SMBG data to BG pool
  poolBG.addPlotType('smbg', require('../js/plot/smbg')(poolBG));

  // bolus & carbs pool
  // set up y-axis
  poolBolus.yAxis(d3.svg.axis()
    .scale(scales.carbs(_.where(data, {'type': 'carbs'}), poolBolus))
    .orient('left')
    .outerTickSize(0)
    .ticks(3));
  // add background fill rectangles to bolus pool
  poolBolus.addPlotType('fill', fill(poolBolus, {endpoints: container.endpoints}));

  // basal pool
  // add background fill rectangles to basal pool
  poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: container.endpoints}));

  // messages pool
  // add background fill rectangles to messages pool
  poolMessages.addPlotType('fill', fill(poolMessages, {endpoints: container.endpoints}));

  var poolGroup = d3.select('#tidelinePools');

  // render BG pool
  poolBG(poolGroup, container.getData(container.initialEndpoints, 'both'));

  // render bolus pool
  poolBolus(poolGroup, container.getData(container.initialEndpoints, 'both'));

  // render basal pool
  poolBasal(poolGroup, container.getData(container.initialEndpoints, 'both'));

  //render messages pool
  poolMessages(poolGroup, container.getData(container.initialEndpoints, 'both'));
});