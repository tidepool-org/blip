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

var DailyCarbsTitle = React.createClass({
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
    var carbs = _.get(this.props, ['data', 'averageDailyCarbs'], null);
    var displayCarbs = carbs ? d3.format('.0f')(carbs) : '--';
    var headerClasses = cx({
      DailyCarbsTitle: true,
      CollapsibleTitle: true,
      'SectionHeader--nodata': !carbs,
      'selectable': true,
    });

    return (
      <h3 className={headerClasses} onClick={this.handleToggleSection}>
        <div className="DailyCarbsTitle-content content">
          <span className="DailyCarbsTitle-label label">Avg daily carbs</span>
          <span className="DailyCarbsTitle-value value">{displayCarbs + ' g'}</span>
        </div>
        <i className={this.props.iconClass}/>
      </h3>
    );
  }
});

module.exports = DailyCarbsTitle;
