var React = require('react');
var moment = require('moment');
var cx = require('classnames');

var ADay = React.createClass({
  propTypes: {
    dayAbbrevMask: React.PropTypes.string.isRequired,
    firstDayAbbrevMask: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired,
    future: React.PropTypes.bool.isRequired,
    mostRecent: React.PropTypes.bool.isRequired,
    isFirst: React.PropTypes.bool.isRequired,
    onHover: React.PropTypes.func.isRequired,
    type: React.PropTypes.string.isRequired
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'D',
      firstDayAbbrevMask: 'MMM D'
    };
  },
  /**
   * We currently do not want to ever re-render this component,
   * possibly subject to change in the future
   *
   * @return {boolean}
   */
  shouldComponentUpdate: function() {
    return false;
  },
  mouseEnter: function () {
    if (this.props.future) {
      return;
    }
    this.props.onHover(this.props.date);
  },
  mouseLeave: function () {
    if (this.props.future) {
      return;
    }
    this.props.onHover(null);
  },
  render: function() {
    var chart = this.props.chart({data: this.props.data, date: this.props.date});
    var date = moment(this.props.date);

    var containerClass = cx({
      'Calendar-day': !this.props.future,
      'Calendar-day--bolus': (this.props.type === 'bolus'),
      'Calendar-day--fingerstick': (this.props.type === 'smbg'),
      'Calendar-day-future': this.props.future,
      'Calendar-day-most-recent': this.props.mostRecent,
      'Calendar-day-odd-month': (date.month() % 2 === 0)
    });

    
    var mask = (date.date() === 1 || this.props.isFirst) ?
      this.props.firstDayAbbrevMask :
      this.props.dayAbbrevMask;
    return (
      <div className={containerClass} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className='Calendar-weekday'>
          {date.format(mask)}
        </p>
        {this.props.future ? null: chart}
      </div>
    );
  }
});

module.exports = ADay;