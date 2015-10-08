var _ = require('lodash');

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
    var options = this.props.selectorOptions;
    var selected = _.find(options, {selected: true});
    if (selected) {
      return (selected && selected.path) ? selected.path : null;
    }
    else {
      var defaultOpt = _.find(options, {default: true});
      return (defaultOpt && defaultOpt.path) ? defaultOpt.path : null;
    }
  } 
};