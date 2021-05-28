
import i18next from 'i18next';

import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment-timezone';
import cx from 'classnames';

import * as constants from '../../logic/constants';

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
  shouldComponentUpdate(nextProps) {
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
    const { type, date } = this.props;
    const t = i18next.t.bind(i18next);
    const mDate = moment.utc(date);

    var isDisabled = (this.props.type === constants.SECTION_TYPE_UNDECLARED);

    var containerClass = cx('Calendar-day--' + type, {
      'Calendar-day': !this.props.future,
      'Calendar-day-future': this.props.future,
      'Calendar-day-most-recent': this.props.mostRecent,
      'Calendar-day--disabled': isDisabled,
    });

    var drawMonthLabel = (mDate.date() === 1 || this.props.isFirst);
    var monthLabel = null;

    if (drawMonthLabel) {
      monthLabel = (
        <span className='Calendar-monthlabel'>{mDate.format(t(this.props.monthAbbrevMask))}</span>
      );
    }

    var chart;
    if (!isDisabled) {
      chart = this.props.chart({
        chartWidth: this.props.chartWidth,
        data: this.props.data,
        date,
        subtotalType: this.props.subtotalType,
      });
    }

    return (
      <div id={`calendar-day-${type}-${date}`} className={containerClass} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className='Calendar-weekday'>
          {(monthLabel) ? monthLabel : mDate.format(t(this.props.dayAbbrevMask))}
        </p>
        {this.props.future ? null: chart}
      </div>
    );
  }
}

export default ADay;
