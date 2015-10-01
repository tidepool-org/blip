var React = require('react');
var moment = require('moment-timezone');
var cx = require('classnames');
var _ = require('lodash');

var constants = require('../../logic/constants');

var HoverDay = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired,
    dayAbbrevMask: React.PropTypes.string.isRequired,
    onHover: React.PropTypes.func.isRequired,
    onSelectDay: React.PropTypes.func.isRequired,
    timezone: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'MMM D'
    };
  },
  handleDblClickDay: function() {
    this.props.onSelectDay(
      moment.tz(this.props.date, this.props.timezone)
        .startOf('day')
        // add 1/2 of 24 hrs in milliseconds, because the date used to switch
        // refers to the center, not the left edge, of the daily view switching to
        // but we want the left edge at midnight
        .add(constants.MS_IN_DAY/2, 'milliseconds')
        .toDate().toISOString()
    );
  },
  mouseEnter: function () {
    this.props.onHover(this.props.date);
  },
  mouseLeave: function () {
    this.props.onHover(null);
  },
  render: function() {
    var containerClass = cx({
      'Calendar-day--bolus': (this.props.type === 'bolus'),
      'Calendar-day--fingerstick': (this.props.type === 'smbg'),
      'Calendar-day--HOVER': true,
    });
    return (
      <div className={containerClass} onDoubleClick={this.handleDblClickDay}
        onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
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