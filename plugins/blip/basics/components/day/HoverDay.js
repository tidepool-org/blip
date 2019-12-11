var React = require('react');
var moment = require('moment-timezone');
var cx = require('classnames');
var _ = require('lodash');
var i18next = require('i18next');
var t = i18next.t.bind(i18next);

var BasicsUtils = require('../BasicsUtils');
var constants = require('../../logic/constants');

var HoverDay = React.createClass({
  mixins: [BasicsUtils],
  propTypes: {
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired,
    dayAbbrevMask: React.PropTypes.string.isRequired,
    hoverDisplay: React.PropTypes.func,
    onHover: React.PropTypes.func.isRequired,
    onSelectDay: React.PropTypes.func.isRequired,
    subtotalType: React.PropTypes.string,
    timezone: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'MMM D'
    };
  },
  handleClickDay: function() {
    this.props.onSelectDay(
      moment.tz(this.props.date, this.props.timezone)
        .startOf('day')
        // add 1/2 of 24 hrs in milliseconds, because the date used to switch
        // refers to the center, not the left edge, of the daily view switching to
        // but we want the left edge at midnight
        .add(constants.MS_IN_DAY/2, 'milliseconds')
        .toDate().toISOString(),
      this.props.title
    );
  },
  mouseEnter: function () {
    this.props.onHover(this.props.date);
  },
  mouseLeave: function () {
    this.props.onHover(null);
  },
  render: function() {
    var containerClass = cx('Calendar-day--' + this.props.type, {
      'Calendar-day--HOVER': true,
    });

    var display = (
      <div className='Calendar-day-text'>
        {this.getCount(this.props.subtotalType)}
      </div>
    );

    if (this.props.hoverDisplay) {
      display = this.props.hoverDisplay({data: this.props.data, date: this.props.date, trackMetric: this.props.trackMetric});
    }

    return (
      <div className={containerClass} onClick={this.handleClickDay}
        onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className='Calendar-weekday'>
          {moment(this.props.date).format(t(this.props.dayAbbrevMask))}
        </p>
        {display}
      </div>
    );
  }
});

module.exports = HoverDay;
