/** @jsx React.DOM */
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

var React = require('react');
var classnames = require('classnames');
var _ = require('lodash');

var SummaryGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    options: React.PropTypes.array.isRequired,
    selectedKey: React.PropTypes.string.isRequired,
    onSelect: React.PropTypes.func.isRequired
  },
  render: function() {
    var self = this;

    var primaryOption = _.find(self.props.options, { primary: true });
    var primaryElem = null;
    if (primaryOption) {
      primaryElem = this.renderInfo(primaryOption);

      if (!self.props.selectedKey) {
        self.props.selectedKey = primaryOption.key;
      }
    }

    var otherOptions = _.filter(self.props.options, function(row) { return row.key !== primaryOption.key; });

    var others = otherOptions.map(self.renderInfo);

    return (
      <div className="SummaryGroup-container">
        {primaryElem}
        <div className="SummaryGroup-info-others">
          {others}
        </div>
      </div>
    );
  },

  renderInfo: function(option) {
    var self = this;
    var classes = classnames({
      'SummaryGroup-info--selected': (option.key === self.props.selectedKey),
      'SummaryGroup-info-primary': !!option.primary,
      'SummaryGroup-info': !option.primary
    });

    var onClick = function() {
      self.props.onSelect(option.key);
    };

    var value = <span className="SummaryGroup-option-count">{option.count}</span>;
    var percentage;
    if (option.percentage) {
      percentage = <span className="SummaryGroup-option-percentage">{(option.percentage*100) + '%'}</span>;
    }

    return (
      <div className={classes} onClick={onClick}>
        <span className="SummaryGroup-option-label">{option.label}</span>
        {percentage}
        {value}
      </div>
    );
  }
     
});

module.exports = SummaryGroup;