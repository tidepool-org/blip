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

/* global d3 */

var _ = require('lodash');
var cx = require('classnames');
var React = require('react');
var basicsActions = require('../../logic/actions');

var DailyDoseTitle = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
    iconClass: React.PropTypes.string.isRequired,
    sectionName: React.PropTypes.string.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },
  handleToggleSection: function(e) {
    if (e) {
      e.preventDefault();
    }
    basicsActions.toggleSection(this.props.sectionName, this.props.trackMetric);
  },
  render: function() {
    var weight = this.getUserWeight();
    var dose = _.get(this.props, ['data', 'totalDailyDose'], null);
    var displayDose = dose ? d3.format('.1f')(dose) : '--';
    var headerClasses = cx({
      DailyDoseTitle: true,
      'SectionHeader--nodata': !dose,
      'selectable': true,
    });
    if (weight && dose) {
      var dosePerKg = dose / weight;
      return (
        <h3 className="DailyDoseTitle" onClick={this.handleToggleSection}>
          <span className="DailyDoseTitle-label">Total daily dose / kg</span>
          <span className="DailyDoseTitle-value DailyDose-text--large">{d3.format('.2f')(dosePerKg)}</span>
          <span className="DailyDoseTitle-value DailyDose-text--small">&nbsp;U</span>
          <i className={this.props.iconClass}/>
        </h3>
      );
    } else {
      return (
        <h3 className={headerClasses} onClick={this.handleToggleSection}>
          <span className="DailyDoseTitle-label">Avg total daily dose</span>
          <span className="DailyDoseTitle-value DailyDose-text--large">{displayDose}</span>
          <span className="DailyDoseTitle-value DailyDose-text--small">&nbsp;U</span>
          <i className={this.props.iconClass}/>
        </h3>
      );
    }
  },
  getUserWeight: function() {
    if (!this.props.data) {
      return null;
    }
    var weight = this.props.data.weight;
    return (weight) ? weight : null;
  }
});

module.exports = DailyDoseTitle;
