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

var _ = require('lodash');
var classnames = require('classnames');
var d3 = require('d3');
var React = require('react');

var basicsActions = require('../../logic/actions');
var BasicsUtils = require('../BasicsUtils');

var SummaryGroup = React.createClass({
  mixins: [BasicsUtils],
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    selectedSubtotal: React.PropTypes.string.isRequired,
    selectorOptions: React.PropTypes.array.isRequired,
    sectionId: React.PropTypes.string.isRequired
  },
  render: function() {
    var self = this;

    var primaryOption = _.find(self.props.selectorOptions, { primary: true });
    var primaryElem = null;
    if (primaryOption) {
      primaryElem = this.renderInfo(primaryOption);

      if (!self.props.selectedSubtotal) {
        self.props.selectedSubtotal = primaryOption.key;
      }
    }

    var otherOptions = _.filter(
      self.props.selectorOptions,
      function(row) {
        return !row.primary;
      }
    );

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
    if (typeof option.active !== 'undefined' && !option.active) {
      return (<div key={option.key} className='SummaryGroup-info SummaryGroup-info-blank'></div>);
    }

    var classes = classnames({
      'SummaryGroup-info--selected': (option.key === this.props.selectedSubtotal),
      'SummaryGroup-info-primary': option.primary,
      'SummaryGroup-info': !option.primary,
    	'SummaryGroup-info-tall': ( !option.primary && this.props.selectorOptions.length <= 4 ),
    	'SummaryGroup-no-percentage': ( !option.primary && !option.percentage )
    });

    var path = option.path;

    var value;
    if (option.key === 'total') {
      if (path) {
        value = this.props.data[path].total;
      }
      else {
        value = this.props.data[option.key];
      }
    }
    else {
      if (path && path === option.key) {
        value = this.props.data[path].total;
      }
      else if (path) {
        value = this.props.data[path][option.key].count;
      }
      else {
        value = this.props.data[option.key].count || 0;
      }
    }

    var percentage;
    if (option.percentage) {
      if (path) {
        percentage = this.props.data[path][option.key].percentage;
      }
      else {
        percentage = this.props.data[option.key].percentage;
      }
    }

    var valueElem = (
      <span className="SummaryGroup-option-count">
        {value}
      </span>
    );
    var percentageElem = (option.percentage) ? (
      <span className="SummaryGroup-option-percentage">
        {d3.format('%')(percentage)}
      </span>
    ) : null;

    var labels = this.labelGenerator({
      bgClasses: this.props.bgClasses,
      bgUnits: this.props.bgUnits
    });

    var labelOpts = option.labelOpts;

    var labelText = option.label ? option.label : labels[labelOpts.type][labelOpts.key];

    var labelElem = (
      <span className="SummaryGroup-option-label">{labelText}</span>
    );

    return (
      <div key={option.key} className={classes}
        onClick={this.handleSelectSubtotal.bind(null, option.key)}>
        {labelElem}
        {percentageElem}
        {valueElem}
      </div>
    );
  },
  handleSelectSubtotal: function(selectedSubtotal) {
    basicsActions.selectSubtotal(this.props.sectionId, selectedSubtotal);
  }
});

module.exports = SummaryGroup;
