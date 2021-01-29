/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import i18next from 'i18next';

var _ = require('lodash');
var PropTypes = require('prop-types');
var React = require('react');
var cx = require('classnames');
var t = i18next.t.bind(i18next);

const { SITE_CHANGE_BY_MANUFACTURER, DEFAULT_MANUFACTURER } = require('../../logic/constants');

class Change extends React.Component {
  static propTypes = {
    daysSince: PropTypes.number.isRequired,
    count: PropTypes.number,
    type: PropTypes.string.isRequired,
    manufacturer: PropTypes.string.isRequired,
  };

  render() {
    var daysText = null;
    var daysSinceNum = null;
    if (!_.isNaN(this.props.daysSince)){
      daysText = (this.props.daysSince === 1) ? t('day') : t('days');
      daysSinceNum = this.props.daysSince;
    }
    var countElement = null;

    if (this.props.count > 1) {
      countElement = <div className='Change-count-text'>
        x{this.props.count}
      </div>;
    }
    const manufacturerClass = _.get(
      _.get(
        SITE_CHANGE_BY_MANUFACTURER,
        this.props.manufacturer,
        SITE_CHANGE_BY_MANUFACTURER[DEFAULT_MANUFACTURER]),
      'class');

    var changeClass = cx({
      'Change': true,
      [`${manufacturerClass}`]: (manufacturerClass !== undefined),
    });

    return (
      <div className={changeClass}>
        <div className='Change-daysSince-text'>
          <span className='Change-daysSince-count'>{daysSinceNum}</span>
          {daysText}
        </div>
        <div className='Change-line-stop'></div>
        {countElement}
      </div>
    );
  }
}

module.exports = Change;