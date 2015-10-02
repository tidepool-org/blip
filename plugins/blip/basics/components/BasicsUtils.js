var _ = require('lodash');

module.exports = {
  /**
   * Get the count value associated with this day
   * 
   * @return {Number}
   */
  getCount: function() {
    if (_.isEmpty(this.props.data) ||
      _.isEmpty(this.props.data.dataByDate[this.props.date])) {
      return 0;
    }
    return this.props.data.dataByDate[this.props.date].count;
  } 
};