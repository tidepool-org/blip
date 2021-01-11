/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017 Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
import i18next from 'i18next';
var t = i18next.t.bind(i18next);

var _ = require('lodash');

var format = require('../../../../js/data/util/format');

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
   * Get the value for a SummaryGroup option
   *
   * @param {Object} option - The SummaryGroup option
   * @param {Object} data - The data object to search
   *
   * @return {Number} The value, or 0 if not found
   */
  getOptionValue: function(option, data) {
    var path = option.path;
    var value = 0;

    if (data) {
      if (option.key === 'total') {
        if (path) {
          value = data[path].total;
        }
        else {
          value = data[option.key];
        }
      }
      else {
        if (path && path === option.key) {
          value = data[path].total;
        }
        else if (path) {
          value = data[path][option.key].count;
        }
        else {
          value = data[option.key].count || 0;
        }
      }
    }

    return value;
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
        verylow: t('below') + " " + format.tooltipBGValue(bgClasses['very-low'].boundary, opts.bgUnits) + bgUnits,
        low: t('between') + " " + format.tooltipBGValue(bgClasses['very-low'].boundary, opts.bgUnits) + ' - ' + format.tooltipBGValue(bgClasses.low.boundary, opts.bgUnits) + bgUnits,
        target: t('between') + " " + format.tooltipBGValue(bgClasses.low.boundary, opts.bgUnits) + ' - ' + format.tooltipBGValue(bgClasses.target.boundary, opts.bgUnits) + bgUnits,
        high: t('between') + " " + format.tooltipBGValue(bgClasses.target.boundary, opts.bgUnits) + ' - ' + format.tooltipBGValue(bgClasses.high.boundary, opts.bgUnits) + bgUnits,
        veryhigh: t('above') + " " + format.tooltipBGValue(bgClasses.high.boundary, opts.bgUnits) + bgUnits
      }
    };
  }
};
