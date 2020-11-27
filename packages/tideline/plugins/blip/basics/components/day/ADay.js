var PropTypes = require('prop-types');
var React = require('react');
var moment = require('moment-timezone');
var cx = require('classnames');
var i18next = require('i18next');
var t = i18next.t.bind(i18next);

var constants = require('../../logic/constants');

class ADay extends React.Component {
  static propTypes = {
    dayAbbrevMask: PropTypes.string.isRequired,
    monthAbbrevMask: PropTypes.string.isRequired,
    chart: PropTypes.func.isRequired,
    chartWidth: PropTypes.number.isRequired,
    data: PropTypes.object,
    date: PropTypes.string.isRequired,
    future: PropTypes.bool.isRequired,
    isFirst: PropTypes.bool.isRequired,
    mostRecent: PropTypes.bool.isRequired,
    onHover: PropTypes.func.isRequired,
    subtotalType: PropTypes.string,
    type: PropTypes.string.isRequired
  };

  static defaultProps = {
    dayAbbrevMask: 'D',
    monthAbbrevMask: 'MMM D'
  };

  /**
   * We currently do not want to ever re-render this component,
   * possibly subject to change in the future
   *
   * @return {boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.subtotalType !== this.props.subtotalType || nextProps.chartWidth !== this.props.chartWidth) {
      return true;
    }
    return false;
  }

  isASiteChangeEvent = () => {
    return (this.props.type === constants.SITE_CHANGE_CANNULA) ||
      (this.props.type === constants.SITE_CHANGE_TUBING) ||
      (this.props.type === constants.SITE_CHANGE_RESERVOIR);
  };

  isASiteChangeDay = () => {
    if (!this.props.data || !this.props.data.infusionSiteHistory) {
      return false;
    }

    return (this.props.data.infusionSiteHistory[this.props.date].type === constants.SITE_CHANGE);
  };

  mouseEnter = () => {
    // We do not want a hover effect on days in the future
    if (this.props.future) {
      return;
    }
    // We do not want a hover effect on infusion site days that were not site changes
    if (this.isASiteChangeEvent() && !this.isASiteChangeDay()) {
      return;
    }
    this.props.onHover(this.props.date);
  };

  mouseLeave = () => {
    if (this.props.future) {
      return;
    }
    this.props.onHover(null);
  };

  render() {
    var date = moment(this.props.date);

    var isDisabled = (this.props.type === constants.SECTION_TYPE_UNDECLARED);

    var containerClass = cx('Calendar-day--' + this.props.type, {
      'Calendar-day': !this.props.future,
      'Calendar-day-future': this.props.future,
      'Calendar-day-most-recent': this.props.mostRecent,
      'Calendar-day--disabled': isDisabled,
    });

    var drawMonthLabel = (date.date() === 1 || this.props.isFirst);
    var monthLabel = null;

    if (drawMonthLabel) {
      monthLabel = (
        <span className='Calendar-monthlabel'>{date.format(t(this.props.monthAbbrevMask))}</span>
      );
    }

    var chart;
    if (!isDisabled) {
      chart = this.props.chart({
        chartWidth: this.props.chartWidth,
        data: this.props.data,
        date: this.props.date,
        subtotalType: this.props.subtotalType,
      });
    }

    return (
      <div className={containerClass} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className='Calendar-weekday'>
          {(monthLabel) ? monthLabel : date.format(t(this.props.dayAbbrevMask))}
        </p>
        {this.props.future ? null: chart}
      </div>
    );
  }
}

module.exports = ADay;
