var d3 = window.d3;

d3.chart('Brush').extend('SMBGMean', {
  initialize: function() {
    var chart = this;

    var r = 2;

    this.layer('meanCircles', this.base.select('#brushMainGroup').append('g').attr('id', 'meanCircles'), {
      dataBind: function() {
        return this.selectAll('circle')
          .data(chart.reducedData, function(d) { return d.key; });
      },
      insert: function() {
        return this.append('circle');
      },
      events: {
        enter: function() {
          var xScale = chart.xScale();

          var yScale = d3.scale.linear()
            .domain(d3.extent(chart.reducedData, function(d) { return d.value.mean; }))
            .range([chart.height - chart.margins().main.bottom - r, r + chart.margins().main.top]);

          this.attr({
            cx: function(d) {
              return xScale(new Date(d.key + 'T00:00:00.000Z'));
            },
            cy: function(d) {
              return yScale(d.value.mean);
            },
            r: r,
            fill: '#989897'
          });
        }
      }
    });
  }
});