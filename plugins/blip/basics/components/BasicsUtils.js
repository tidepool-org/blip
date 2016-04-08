var _ = require('lodash');

var tideline = require('../../../../js/index');
var format = tideline.data.util.format;

module.exports = {
  /**
   * Get the count value associated with this day
   *
   * @param {String|null} selected subtotal type/tag
   * 
   * @return {Number}
   */
  getCount: function(subtotalType) {
    if (_.isEmpty(this.props.data) ||
      _.isEmpty(this.props.data.dataByDate[this.props.date])) {
      return 0;
    }
    var dateData = this.props.data.dataByDate[this.props.date];
    if (subtotalType) {
      if (subtotalType === 'total') {
        return dateData.total;
      }
      if (dateData.subtotals) {
        return dateData.subtotals[subtotalType] || 0;
      }
      else {
        return dateData.count;
      }
    }
    return dateData.total || 0;
  },
  /**
   * Get the `path` to the relevant sub-section of data, if any
   *
   * @return {String}
   */
  getPathToSelected: function() {
    function findInOptions(options, filter) {
      if (!options || !options.rows) {
        return null;
      }

      var allOptions =  _.flatten(options.rows);
      allOptions.push(options.primary);

      return _.find(allOptions, filter);
    }

    var options = this.props.selectorOptions;
    var selected = findInOptions(options, {selected: true});

    if (selected) {
      return (selected && selected.path) ? selected.path : null;
    }
    else if (options) {
      var defaultOpt = options.primary;
      return (defaultOpt && defaultOpt.path) ? defaultOpt.path : null;
    }

    return null;
  },
  labelGenerator: function(opts) {
    var bgClasses = opts.bgClasses;
    var bgUnits = ' ' + opts.bgUnits;

    return {
      bg: {
        verylow: 'below ' + format.tooltipBGValue(bgClasses['very-low'].boundary, bgUnits) + bgUnits,
        low: 'between ' + format.tooltipBGValue(bgClasses['very-low'].boundary, bgUnits) + ' - ' + format.tooltipBGValue(bgClasses.low.boundary, bgUnits) + bgUnits,
        target: 'between ' + format.tooltipBGValue(bgClasses.low.boundary, bgUnits) + ' - ' + format.tooltipBGValue(bgClasses.target.boundary, bgUnits) + bgUnits,
        high: 'between ' + format.tooltipBGValue(bgClasses.target.boundary, bgUnits) + ' - ' + format.tooltipBGValue(bgClasses.high.boundary, bgUnits) + bgUnits,
        veryhigh: 'above ' + format.tooltipBGValue(bgClasses.high.boundary, bgUnits) + bgUnits
      }
    };
  }
};