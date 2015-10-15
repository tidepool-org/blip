/* 
 * == BSD2 LICENSE ==
 */

var React = require('react');
var cx = require('classnames');

var DayGrouping = React.createClass({
  propTypes: {
    active: React.PropTypes.bool.isRequired,
    category: React.PropTypes.string.isRequired,
    days: React.PropTypes.array.isRequired,
    onClickGroup: React.PropTypes.func.isRequired
  },
  render: function() {
    var groupClass = cx({
      'daysGroup': true,
      'active': this.props.active
    }) + ' ' + this.props.category;
    /* jshint ignore:start */
    return (
      <div className={groupClass} onClick={this.handleDaysGroupClick}>{this.props.days}</div>
      );
    /* jshint ignore:end */
  },
  handleDaysGroupClick: function() {
    this.props.onClickGroup(this.props.category);
  }
});

module.exports = DayGrouping;