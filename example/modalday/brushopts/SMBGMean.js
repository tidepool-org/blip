var _ = require('lodash');
var d3 = window.d3;

d3.chart('Brush').extend('SMBGMean', {
  initialize: function() {
    var chart = this;

    var r = 4;

    this.layer('meanCircles', this.base.select('#brushMainGroup').append('g').attr('id', 'meanCircles'), {
      dataBind: function() {
        var data = _.filter(chart.reducedData, function(d) { return d.value.mean != null; });
        return this.selectAll('circle')
          .data(data, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('circle');
      },
      events: {
        enter: function() {
          var mainMargins = chart.margins().main;
          var xScale = chart.xScale().range([mainMargins.left + r, chart.width - mainMargins.right - r]);

          var yScale = d3.scale.linear()
            .domain(d3.extent(chart.reducedData, function(d) { return d.value.mean; }))
            .range([chart.height - mainMargins.bottom - r, r + mainMargins.top]);

          this.attr({
            cx: function(d) {
              return xScale(new Date(d.key + 'T00:00:00.000Z'));
            },
            cy: function(d) {
              return yScale(d.value.mean);
            },
            r: r,
            fill: '#847AA5'
          });
        }
      }
    });
  }
});