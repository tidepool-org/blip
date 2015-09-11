var React = require('react');
var moment = require('moment');
var cx = require('classnames');
var _ = require('lodash');

var HoverDay = React.createClass({
  propTypes: {
    dayAbbrevMask: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired,
    onHover: React.PropTypes.func.isRequired
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'MMM D'
    };
  },
  mouseEnter: function () {
    this.props.onHover(this.props.date);
  },

  mouseLeave: function () {
    this.props.onHover(null);
  },
  render: function() {
    var containerClass = cx({
      'Calendar-day--HOVER': true,
      'Calendar-day--HOVER-bolus': (this.props.type === 'bolus')
    });
    return (
      <div className={containerClass} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className='Calendar-weekday'>
          {moment(this.props.date).format(this.props.dayAbbrevMask)}
        </p>
        <div className='Calendar-day-text'>
          {this.getCount()}
        </div>
      </div>
    );
  },
  /**
   * Get the count value associated with this day
   * 
   * @return {Number}
   */
  getCount: function() {
    if (_.isEmpty(this.props.data)) {
      return 0;
    }
    return this.props.data.countByDate[this.props.date];
  }
});

module.exports = HoverDay;