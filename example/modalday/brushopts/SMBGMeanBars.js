var d3 = window.d3;

d3.chart('Brush').extend('SMBGMeanBars', {
  initialize: function() {
    var chart = this;

    var r = 2;

    this.layer('meanBars', this.base.select('#brushMainGroup').append('g').attr('id', 'meanBars'), {
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
          var width = extent/chart.days.length;

          var yScale = d3.scale.linear()
            .domain(d3.extent(chart.reducedData, function(d) { return d.value.mean; }))
            .range([chart.height - chart.margins().main.bottom - r, r + chart.margins().main.top]);

          this.attr({
            x: function(d) {
              return xScale(new Date(d.key + 'T00:00:00.000Z'));
            },
            y: function(d) {
              return yScale(d.value.mean);
            },
            width: width,
            height: function(d) {
                return chart.height - chart.margins().main.bottom - yScale(d.value.mean);
            },
            fill: '#847AA5'
          });
        }
      }
    });
  }
});