var React = require('react');
var moment = require('moment');
var cx = require('classnames');

var ADay = React.createClass({
  propTypes: {
    dayAbbrevMask: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired,
    future: React.PropTypes.bool.isRequired,
    mostRecent: React.PropTypes.bool.isRequired,
    onHover: React.PropTypes.func.isRequired
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'D'
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
    this.props.onHover(this.props.date);
  },

  mouseLeave: function () {
    this.props.onHover(null);
  },
  render: function() {
    var chart = this.props.chart({data: this.props.data, date: this.props.date});

    var containerClass = cx({
      'Calendar-day': !this.props.future,
      'Calendar-day-future': this.props.future,
      'Calendar-day-most-recent': this.props.mostRecent
    });

    return (
      <div className={containerClass} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className='Calendar-weekday'>
          {moment(this.props.date).format(this.props.dayAbbrevMask)}
        </p>
        {this.props.future ? null: chart}
      </div>
    );
  }
});

module.exports = ADay;