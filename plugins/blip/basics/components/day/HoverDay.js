var React = require('react');
var moment = require('moment');
var cx = require('classnames');
var _ = require('lodash');

var BasicsUtils = require('../BasicsUtils');

var HoverDay = React.createClass({
  mixins: [BasicsUtils],
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
      'Calendar-day--bolus': (this.props.type === 'bolus'),
      'Calendar-day--fingerstick': (this.props.type === 'smbg'),
      'Calendar-day--HOVER': true,
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
  }
});

module.exports = HoverDay;