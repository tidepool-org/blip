var d3 = window.d3;

d3.chart('Brush').extend('SMBGMeanHeat', {
  initialize: function() {
    var chart = this;

    var r = 2;

    this.layer('meanRects', this.base.select('#brushMainGroup').append('g').attr('id', 'meanRects'), {
      dataBind: function() {
        return this.selectAll('rect')
          .data(chart.reducedData, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('rect');
      },
      events: {
        enter: function() {
          var xScale = chart.xScale();
          var range = xScale.range();
          var extent = range[1] - range[0];

          var fillScale = d3.scale.linear()
            .domain(d3.extent(chart.reducedData, function(d) { return d.value.mean; }))
            .range(['#F1F1F1', '#847AA5'])
            .interpolate(d3.interpolateLab);

          var mainMargins = chart.margins().main;

          this.attr({
            x: function(d) {
              return xScale(new Date(d.key + 'T00:00:00.000Z'));
            },
            y: mainMargins.top,
            width: extent/chart.days.length,
            height: chart.height - mainMargins.top - mainMargins.bottom,
            fill: function(d) {
              var fill = fillScale(d.value.mean);
              if (fill !== '#ffffff') {
                return fill;
              }
              else {
                return 'none';
              }
            }
          });
        }
      }
    });
  }
});