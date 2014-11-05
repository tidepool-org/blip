var _ = require('lodash');
var crossfilter = require('crossfilter');
var d3 = window.d3;

var bgboundaryClass = require('../../js/plot/util/bgboundary');
var commonbolus = require('../../js/plot/util/commonbolus');
var format = require('../../js/data/util/format');

d3.chart('Stats', {
  initialize: function() {
    var chart = this;

    var mainGroup = this.base.append('g')
      .attr({
        id: 'statsMainGroup',
        'class': 'd3-stats'
      });
    var basalBolusRatio = mainGroup.append('g').attr('id', 'basalBolusRatio');
    var basalBolusRatioText = basalBolusRatio.append('text').attr('class', 'd3-stats-display');
    var bgRange = mainGroup.append('g').attr('id', 'bgRange');
    var bgRangeText = bgRange.append('text').attr('class', 'd3-stats-display');
    var bgMean = mainGroup.append('g').attr('id', 'bgMean');
    // TODO: pass in some kind of bgDomain or calculate domain from reducedData
    var yScale = d3.scale.linear().domain([40,300]);

    var pieDataFn = d3.layout.pie().value(function(d) { return d.value; }).sort(null);
    var arcFn = d3.svg.arc().innerRadius(0);

    this.layer('basalBolusRatio', this.base.select('#basalBolusRatio'), {
      dataBind: function(data) {
        return this.selectAll('path')
          .data(pieDataFn(data.ratio));
      },
      insert: function() {
        return this.append('path')
          .attr('class', function(d) {
            return 'd3-stats-slice d3-' + d.data.key;
          });
      },
      events: {
        enter: function() {
          basalBolusRatio.select('circle').classed('hidden', true);
          basalBolusRatio.classed('d3-insufficient-data', false);
          this.attr({
            d: arcFn.outerRadius(chart.height/2)
          });
        },
        update: function() {
          var mainMargins = chart.margins().main;
          this.attr({
            d: arcFn.outerRadius(chart.height/2)
          });
        },
        exit: function() {
          basalBolusRatio.select('circle').classed('hidden', false);
          basalBolusRatio.classed('d3-insufficient-data', true);
          this.remove();
        }
      }
    });

    this.layer('basalBolusRatioText', basalBolusRatioText, {
      dataBind: function(data) {
        if (data.ratio.length === 0) {
          data.ratio = [{
            key: 'basal',
            text: '-- % : '
          }, {
            key: 'bolus',
            text: '-- %'
          }];
        }
        return this.selectAll('tspan')
          .data(_.sortBy(data.ratio, function(d) { return d.key; }));
      },
      insert: function() {
        return this.append('tspan')
          .attr('class', function(d) {
            return 'd3-stats-' + d.key;
          });
      },
      events: {
        enter: function() {
          basalBolusRatioText.attr({
            x: chart.width/18,
            y: chart.height*3/10
          });
          this.text(function(d) {
            var text = d.value ? format.percentage(d.value) : d.text;
            if (d.value && d.key === 'basal') {
              return text + ' : ';
            }
            return text;
          });
        },
        update: function() {
          this.text(function(d) {
            var text = d.value ? format.percentage(d.value) : d.text;
            if (d.value && d.key === 'basal') {
              return text + ' : ';
            }
            return text;
          });
        }
      }
    });

    this.layer('bgRange', this.base.select('#bgRange'), {
      dataBind: function(data) {
        return this.selectAll('path')
          .data(pieDataFn(data.range));
      },
      insert: function() {
        return this.append('path')
          .attr('class', function(d) {
            return 'd3-stats-slice d3-bg-' + d.data.key;
          });
      },
      events: {
        enter: function() {
          bgRange.select('circle').classed('hidden', true);
          bgRange.classed('d3-insufficient-data', false);
          this.attr({
            d: arcFn.outerRadius(chart.height/2)
          });
        },
        update: function() {
          bgRange.select('.d3-stats-head')
            .text(function() {
              if (chart.bgType() === 'cbg') {
                return 'Time in Target Range';
              }
              return 'Readings in Range';
            });
          this.attr({
            d: arcFn.outerRadius(chart.height/2)
          });
        },
        exit: function() {
          bgRange.select('circle').classed('hidden', false);
          bgRange.classed('d3-insufficient-data', true);
          this.remove();
        }
      }
    });

    this.layer('bgRangeText', bgRangeText, {
      dataBind: function(data) {
        var target;
        if (data.range.length === 0) {
          target = [{text: '-- %'}];
        }
        else {
          target = _.where(data.range, {key: 'target'});
        }
        return this.selectAll('tspan')
          .data(target);
      },
      insert: function() {
        return this.append('tspan')
          .attr('class', function(d) {
            return 'd3-stats-percentage';
          });
      },
      events: {
        enter: function() {
          bgRangeText.attr({
            x: chart.width/18,
            y: chart.height*3/10
          });
          this.text(function(d) {
            return d.value ? format.percentage(d.value) : d.text;
          });
        },
        update: function() {
          this.text(function(d) {
            return d.value ? format.percentage(d.value) : d.text;
          }); 
        }
      }
    });

    this.layer('bgMean', bgMean, {
      dataBind: function(data) {
        bgMean.classed('d3-insufficient-data', isNaN(data.mean));
        return this.selectAll('g')
          .data([{value: data.mean}]);
      },
      insert: function() {
        return this.append('g');
      },
      events: {
        enter: function() {
          // TODO: remove magic number 7 as radius of bg circle
          yScale = yScale.range([chart.height - 7, 7]);
          var currentClass = this.attr('class');
          var toEnter = this;
          toEnter.append('circle')
            .attr({
              r: 7,
              cx: 44,
              cy: function(d) { return yScale(d.value); },
              'class': function(d) {
                return 'd3-stats-circle d3-smbg d3-circle-smbg' + ' ' + chart.bgBoundary(d);
              }
            })
            .classed('hidden', function(d) { return isNaN(d.value); });
          toEnter.append('text')
            .attr({
              'class': 'd3-stats-display',
              x: chart.width/8,
              y: chart.height*8/10
            })
            .append('tspan')
            .attr('class', function(d) {
              if (isNaN(d.value)) {
                return '';
              }
              return chart.bgBoundary(d).replace('bg', 'stats');
            })
            .text(function(d) {
              if (isNaN(d.value)) {
                return '-- ' + chart.bgUnits();
              }
              return Math.round(d.value) + ' ' + chart.bgUnits();
            });

        },
        update: function() {
          var toUpdate = this;
          toUpdate.select('circle')
            .attr({
              cx: 44,
              cy: function(d) { return yScale(d.value); },
              'class': function(d) {
                return 'd3-stats-circle d3-smbg d3-circle-smbg' + ' ' + chart.bgBoundary(d);
              }
            })
            .classed('hidden', function(d) { return isNaN(d.value); });
          toUpdate.select('tspan')
            .attr('class', function(d) {
              if (isNaN(d.value)) {
                return '';
              }
              return chart.bgBoundary(d).replace('bg', 'stats');
            })
            .text(function(d) {
              if (isNaN(d.value)) {
                return '-- ' + chart.bgUnits();
              }
              return Math.round(d.value) + ' ' + chart.bgUnits();
            });
        }
      }
    });
  },
  activeDays: function(activeDays) {
    if (!arguments.length) { return this._activeDays; }
    this._activeDays = activeDays;
    return this;
  },
  addText: function() {
    this.base.select('#basalBolusRatio').append('text')
      .attr({
        'class': 'd3-stats-head',
        x: this.width/18,
        y: -this.height/2
      })
      .text('Basal : Bolus');
    this.base.select('#basalBolusRatio').append('text')
      .attr({
        'class': 'd3-stats-lead',
        x: this.width/18,
        y: -this.height/20
      })
      .text('Basal to bolus insulin ratio');

    this.base.select('#bgRange').append('text')
      .attr({
        'class': 'd3-stats-head',
        x: this.width/18,
        y: -this.height/2
      })
      .text(function() {
        return 'Time in Target Range';
      });
    var classes = this.bgClasses();
    this.base.select('#bgRange').append('text')
      .attr({
        'class': 'd3-stats-lead',
        x: this.width/18,
        y: -this.height/20
      })
      .text('Target range: ' + classes.low.boundary + ' - ' + classes.target.boundary + ' ' + this.bgUnits());
    var yScale = d3.scale.linear().domain([40,300]).range([this.height - 7, 7]);
    this.base.select('#bgMean').append('line')
      .attr({
        x1: 0,
        x2: 88,
        y1: function(d) { return yScale(80); },
        y2: function(d) { return yScale(80); },
        'class': 'd3-line-guide d3-line-bg-threshold'
      });
    this.base.select('#bgMean').append('line')
      .attr({
        x1: 0,
        x2: 88,
        y1: function(d) { return yScale(180); },
        y2: function(d) { return yScale(180); },
        'class': 'd3-line-guide d3-line-bg-threshold'
      });

    this.base.select('#bgMean').append('text')
      .attr({
        'class': 'd3-stats-head',
        x: this.width/8,
        y: 0
      })
      .text('Average BG');
    this.base.select('#bgMean').append('text')
      .attr({
        'class': 'd3-stats-lead',
        x: this.width/8,
        y: this.height*0.45
      })
      .text('Selected days');
  },
  bgClasses: function(bgClasses) {
    if (!arguments.length) { return this._bgClasses; }
    this._bgClasses = bgClasses;
    this.bgBoundary = bgboundaryClass(bgClasses);
    return this;
  },
  bgType: function(bgType) {
    if (!arguments.length) { return this._bgType; }
    this._bgType = bgType;
    return this;
  },
  bgUnits: function(bgUnits) {
    if (!arguments.length) { return this._bgUnits; }
    this._bgUnits = bgUnits;
    return this;
  },
  margins: function(margins) {
    if (!arguments.length) { return this._margins; }
    this._margins = margins;
    this.width = this.base.attr('width') - margins.main.left - margins.main.right;
    this.height = this.base.attr('height') - margins.main.top - margins.main.bottom;
    var circleY = this.base.attr('height') - margins.main.bottom - this.height/2;
    var rPlus = this.width/18;
    var mainGroup = this.base.select('#statsMainGroup')
      .attr('transform', 'translate(' + margins.main.left + ',0)');

    var basalBolusRatio = mainGroup.select('#basalBolusRatio')
      .attr({
        'class': 'd3-stats d3-insufficient-data d3-stats-pie',
        'transform': 'translate(' + rPlus + ',' + circleY + ')'
      })
      .append('circle')
      .attr({
        'class': 'd3-stats-circle',
        cx: 0,
        cy: 0,
        r: this.height/2
      });

    var bgRange = mainGroup.select('#bgRange')
      .attr({
        'class': 'd3-stats d3-insufficient-data d3-stats-pie',
        'transform': 'translate(' + (this.width/3 + rPlus) + ',' + circleY + ')'
      })
      .append('circle')
      .attr({
        'class': 'd3-stats-circle',
        cx: 0,
        cy: 0,
        r: this.height/2
      });

    var bgMean = mainGroup.select('#bgMean')
      .attr({
        'class': 'd3-stats d3-insufficient-data',
        'transform': 'translate(' + (this.width/3 * 2 + rPlus) + ',0)'
      });
    bgMean.append('rect')
      .attr({
        'class': 'd3-stats-rect rect-left',
        x: 0,
        y: 0,
        width: 44,
        height: this.height
      });
    bgMean.append('rect')
      .attr({
        'class': 'd3-stats-rect rect-right',
        x: 44,
        y: 0,
        width: 44,
        height: this.height
      });
    this.addText();
    return this;
  },
  reducedData: function(groups) {
    console.time('Reduce Stats');
    var crossData = crossfilter(groups.basal.concat(groups.bolus.concat(groups.cbg.concat(groups.smbg))));
    var dataByDate = crossData.dimension(function(d) { return d.normalTime.slice(0,10); });
    var grouped = dataByDate.group();
    function basalDose(d) {
      return d.rate * d.duration/3600000;
    }
    var bgClasses = this.bgClasses();
    function categorize(val, breakdown) {
      if (val < bgClasses.low.boundary) {
        breakdown.low += 1;
        return;
      }
      else if (val <= bgClasses.target.boundary) {
        breakdown.target += 1;
        return;
      }
      else if (val > bgClasses.target.boundary) {
        breakdown.high += 1;
        return;
      }
    }
    function uncategorize(val, breakdown) {
      if (val < bgClasses.low.boundary) {
        breakdown.low -= 1;
        return;
      }
      else if (val <= bgClasses.target.boundary) {
        breakdown.target -= 1;
        return;
      }
      else if (val > bgClasses.high.boundary) {
        breakdown.high -= 1;
        return;
      }
    }
    grouped.reduce(
      function reduceAdd(p, v) {
        if (v.type === 'basal') {
          if (isNaN(p.basal.insulin)) {
            p.basal.insulin = basalDose(v);
            p.basal.time = v.duration;
          }
          else {
            p.basal.insulin += basalDose(v);
            p.basal.time += v.duration;
          }
        }
        if (v.type === 'bolus') {
          if (isNaN(p.bolus)) {
            p.bolus = commonbolus.getDelivered(v);
          }
          else {
            p.bolus += commonbolus.getDelivered(v);
          }
        }
        if (v.type === 'cbg') {
          if (p.cbg.n === 0) {
            p.cbg.n = 1;
            p.cbg.total = v.value;
            categorize(v.value, p.cbg.breakdown);
          }
          else {
            p.cbg.n += 1;
            p.cbg.total += v.value;
            categorize(v.value, p.cbg.breakdown);
          }
        }
        if (v.type === 'smbg') {
          if (p.smbg.n === 0) {
            p.smbg.n = 1;
            p.smbg.total = v.value;
            categorize(v.value, p.smbg.breakdown);
          }
          else {
            p.smbg.n += 1;
            p.smbg.total += v.value;
            categorize(v.value, p.smbg.breakdown);
          }
        }
        return p;
      },
      function reduceRemove(p, v) {
        if (v.type === 'basal') {
          p.basal.insulin -= basalDose(v);
          p.basal.time -= v.duration;
          if (Math.round(p.basal.insulin) <= 0) {
            p.basal.insulin = NaN;
            p.basal.time = NaN;
          }
        }
        if (v.type === 'bolus') {
          p.bolus -= commonbolus.getDelivered(v);
          if (Math.round(p.bolus) <= 0) {
            p.bolus = NaN;
          }
        }
        if (v.type === 'cbg') {
          p.cbg.n -= 1;
          if (p.cbg.n === 0) {
            p.cbg.total = NaN;
          }
          else {
            p.cbg.total += v.value;
          }
          uncategorize(v.value, p.cbg.breakdown);
        }
        if (v.type === 'smbg') {
          p.smbg.n -= 1;
          if (p.smbg.n === 0) {
            p.smbg.total = NaN;
          }
          else {
            p.smbg.total += v.value;
          }
          uncategorize(v.value, p.smbg.breakdown);
        }
        return p;
      },
      function reduceInitial() {
        return {
          basal: {
            insulin: NaN,
            time: NaN
          },
          bolus: NaN,
          cbg: {
            n: 0,
            total: NaN,
            breakdown: {
              low: 0,
              target: 0,
              high: 0
            }
          },
          smbg: {
            n: 0,
            total: NaN,
            breakdown: {
              low: 0,
              target: 0,
              high: 0
            }
          }
        };
      }
    );
    var reduced = grouped.all();
    this.reducedData = {};
    for (var i = 0; i < reduced.length; ++i) {
      var d = reduced[i];
      this.reducedData[d.key] = d.value;
    }

    console.timeEnd('Reduce Stats');
    return this;
  },
  remove: function() {
    this.base.remove();

    return this;
  },
  transform: function(data) {
    var activeDays = this.activeDays();
    var days = [];
    _.each(d3.time.day.utc.range(
      d3.time.day.utc.floor(new Date(data[0])),
      d3.time.day.utc.ceil(new Date(data[1]))
    ), function(d) {
      if (activeDays[d3.time.format.utc('%A')(d).toLowerCase()]) {
        days.push(d.toISOString().slice(0,10));
      }
    });

    var dailyData = this.reducedData;

    var basal = {totalInsulin: 0, totalTime: 0, nDays: 0}, totalBolus = 0;
    var cbg = {
      breakdown: {
        low: 0,
        target: 0,
        high: 0
      },
      nDays: 0,
      totalBG: 0,
      totalN: 0
    };
    var smbg = {
      breakdown: {
        low: 0,
        target: 0,
        high: 0
      },
      nDays: 0,
      totalBG: 0,
      totalN: 0
    };

    for (var i = 0; i < days.length; ++i) {
      var d = dailyData[days[i]];
      if (!d) { continue; }
      basal.nDays += 1;
      cbg.nDays += 1;
      smbg.nDays += 1;
      if (d.basal && d.basal.time >= 864e5) {
        basal.totalInsulin += d.basal.insulin;
        basal.totalTime += d.basal.time;
        if (!isNaN(d.bolus)) {
          totalBolus += d.bolus;
        }
      }
      // TODO: pass in via opts
      if (d.cbg && d.cbg.n >= 216) {
        cbg.breakdown.low += d.cbg.breakdown.low;
        cbg.breakdown.target += d.cbg.breakdown.target;
        cbg.breakdown.high += d.cbg.breakdown.high;
        cbg.totalBG += d.cbg.total;
        cbg.totalN += d.cbg.n;
      }
      // TODO: pass in via opts
      if (d.smbg && d.smbg.n >= 4) {
        smbg.breakdown.low += d.smbg.breakdown.low;
        smbg.breakdown.target += d.smbg.breakdown.target;
        smbg.breakdown.high += d.smbg.breakdown.high;
        smbg.totalBG += d.smbg.total;
        smbg.totalN += d.smbg.n;
      }
    }
    var res = {bgType: null, mean: NaN, range: [], ratio: []};
    if (basal.totalTime/basal.nDays >= 864e5/2) {
      var totalInsulin = basal.totalInsulin + totalBolus;
      res.ratio.push({
        key: 'bolus',
        value: totalBolus/totalInsulin
      });
      res.ratio.push({
        key: 'basal',
        value: basal.totalInsulin/totalInsulin
      });
    }
    if (cbg.totalN/cbg.nDays >= 216/2) {
      res.range.push({
        key: 'low',
        value: cbg.breakdown.low/cbg.totalN
      });
      res.range.push({
        key: 'target',
        value: cbg.breakdown.target/cbg.totalN
      });
      res.range.push({
        key: 'high',
        value: cbg.breakdown.high/cbg.totalN
      });
      res.mean = cbg.totalBG/cbg.totalN;
      this.bgType('cbg');
    }
    else if (smbg.totalN/smbg.nDays >= 4/2) {
      res.range.push({
        key: 'low',
        value: smbg.breakdown.low/smbg.totalN
      });
      res.range.push({
        key: 'target',
        value: smbg.breakdown.target/smbg.totalN
      });
      res.range.push({
        key: 'high',
        value: smbg.breakdown.high/smbg.totalN
      });
      res.mean = smbg.totalBG/smbg.totalN;
      this.bgType('smbg');
    }
    return res;
  }
});

var chart;

module.exports = {
  create: function(el, dateDimension, opts) {
    opts = opts || {};
    var defaults = {
      baseMargin: opts.baseMargin || 10,
      statsHeight: 80
    };
    defaults.margins = {
      main: {
        top: 2.5,
        right: defaults.baseMargin,
        bottom: defaults.baseMargin,
        left: 50 + defaults.baseMargin
      }
    };
    _.defaults(opts, defaults);

    chart = d3.select(el)
      .append('svg')
      .attr({
        width: el.offsetWidth,
        height: opts.statsHeight
      })
      .chart('Stats')
      .bgClasses(opts.bgClasses)
      .bgUnits(opts.bgUnits)
      .margins(opts.margins)
      .reducedData(dateDimension);

    return this;
  },
  render: function(data, activeDays, opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts, defaults);

    chart.activeDays(activeDays)
      .draw(data);

    return this;
  },
  destroy: function() {
    chart.remove();

    return this;
  }
};