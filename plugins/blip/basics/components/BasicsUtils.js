var _ = require('lodash');

module.exports = {
  /**
   * Get the count value associated with this day
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
  } 
};