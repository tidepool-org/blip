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
var i18next = require('i18next');
var t = i18next.t.bind(i18next);

var React = require('react');
var annotations = require('../../../../../js/plot/util/annotations/annotationdefinitions');

var UnknownStatistic = React.createClass({
  render: function() {
    return (
      <p className="UnknownStatistic">
        <span className="UnknownStatistic-lead">{annotations.LEAD_TEXT['stats-insufficient-data']()} </span>
        {t("At least three days do not have boluses, so this statistic might not be right")}.
      </p>
    );
  }
});

module.exports = UnknownStatistic;
