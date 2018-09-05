/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016 Tidepool Project
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

/* global d3 */
var i18next = require('i18next');
var t = i18next.t.bind(i18next);

var _ = require('lodash');
var cx = require('classnames');
var React = require('react');

var UnknownStatistic = require('../misc/UnknownStatistic');

var DailyCarbs = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  render: function() {

    var averageDailyCarbs = _.get(this.props.data, 'averageDailyCarbs', null);
    var decimal = d3.format('.0f');
    var circleAmountLabel = decimal(averageDailyCarbs) + ' g';
    if (averageDailyCarbs === null) {
      circleAmountLabel = '-- g';
    }

    var headerClasses = cx({
      DailyCarbs: true,
      'SectionHeader--nodata': !averageDailyCarbs,
      'selectable': false,
    });
    return (
      <div className={headerClasses}>
        <span className="DailyCarbs-label">{t("Avg daily carbs")}</span>
        <span className="DailyCarbs-amount">{circleAmountLabel}</span>
        {averageDailyCarbs ? null : (<UnknownStatistic />)}
      </div>
    );
  }
});

module.exports = DailyCarbs;
