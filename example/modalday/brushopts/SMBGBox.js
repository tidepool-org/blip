var _ = require('lodash');
var d3 = window.d3;

d3.chart('Brush').extend('SMBGBox', {
  initialize: function() {
    var chart = this;

    var r = 2;

    this.layer('meanBoxes', this.base.select('#brushMainGroup').append('g').attr('id', 'meanBoxes'), {
      dataBind: function() {
        return this.selectAll('g')
          .data(chart.reducedData, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('g');
      },
      events: {
        enter: function() {
          var toEnter = this;
          var xScale = chart.xScale();
          var range = xScale.range();
          var extent = range[1] - range[0];
          var width = extent/chart.days.length;

          var allValues = _.flatten(_.map(chart.reducedData, function(d) { return [d.value.mean, d.value.low, d.value.high]; }));

          var yScale = d3.scale.linear()
            .domain(d3.extent(allValues))
            .range([chart.height - chart.margins().main.bottom - r, r + chart.margins().main.top]);

          var xPosition = function(d) {
            return xScale(new Date(d.key + 'T00:00:00.000Z')) + width/4;
          };

          toEnter.append('rect')
            .attr({
              x: xPosition,
              y: function(d) {
                return yScale(d.value.high);
              },
              width: width/2,
              height: function(d) {
                return yScale(d.value.low) - yScale(d.value.high);
              },
              fill: '#847AA5'
            });

          toEnter.append('rect')
            .attr({
              x: xPosition,
              y: function(d) {
                return yScale(d.value.mean) - 1;
              },
              width: width/2,
              height: 2,
              fill: 'white'
            });
        }
      }
    });
  }
});