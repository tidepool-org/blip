
import i18next from 'i18next';

var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');
var moment = require('moment-timezone');
var cx = require('classnames');
var _ = require('lodash');
var t = i18next.t.bind(i18next);

var BasicsUtils = require('../BasicsUtils');
var constants = require('../../logic/constants');

var HoverDay = createReactClass({
  displayName: 'HoverDay',
  mixins: [BasicsUtils],

  propTypes: {
    data: PropTypes.object,
    date: PropTypes.string.isRequired,
    dayAbbrevMask: PropTypes.string.isRequired,
    hoverDisplay: PropTypes.func,
    onHover: PropTypes.func.isRequired,
    onSelectDay: PropTypes.func.isRequired,
    subtotalType: PropTypes.string,
    timezone: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    trackMetric: PropTypes.func.isRequired,
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
  },
});

module.exports = HoverDay;
