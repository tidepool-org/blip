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
var format = require('../../../../../js/data/util/format');

var SummaryGroup = React.createClass({
  mixins: [BasicsUtils],
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    selectedSubtotal: React.PropTypes.string.isRequired,
    selectorOptions: React.PropTypes.object.isRequired,
    sectionId: React.PropTypes.string.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },

  actions: basicsActions,

  render: function() {
    var self = this;
    var primaryOption = self.props.selectorOptions.primary;
    var primaryElem = null;
    if (primaryOption) {
      primaryOption.primary = true; //need to have property present indicating option is primary
      primaryElem = this.renderOption(primaryOption);

      if (!self.props.selectedSubtotal) {
        self.props.selectedSubtotal = primaryOption.key;
      }
    }

    var optionRows = self.props.selectorOptions.rows;

    var others = optionRows.map(function(row, id) {
      var options = row.map(self.renderOption);
      return (
        <div key={'row-'+id} className="SummaryGroup-row">
          {options}
        </div>
      );
    });

    return (
      <div className="SummaryGroup-container">
        {primaryElem}
        <div className="SummaryGroup-info-others">
          {others}
        </div>
      </div>
    );
  },

  renderOption: function(option) {
    if (typeof option.active !== 'undefined' && !option.active) {
      return null; //(<div key={option.key} className='SummaryGroup-info SummaryGroup-info-blank'></div>);
    }

    var classes = classnames({
      'SummaryGroup-info--selected': (option.key === this.props.selectedSubtotal),
      'SummaryGroup-info-primary': option.primary,
      'SummaryGroup-info-primary--average': option.primary && option.average,
      'SummaryGroup-info': !option.primary,
      'SummaryGroup-info-tall': (!option.primary && this.props.selectorOptions.length <= 4),
      'SummaryGroup-no-percentage': (!option.primary && !option.percentage)
    });

    var path = option.path;
    var value = this.getOptionValue(option, this.props.data);

    option.disabled = false;
    if (value === 0) {
      option.disabled = true;
      classes += ' SummaryGroup-info--disabled';
    }

    if (option.primary && option.average) {
      var average;
      if (option.path) {
        average = this.props.data[path].avgPerDay;
      }
      else {
        average = this.props.data.avgPerDay;
      }
      if (isNaN(average)) {
        average = 0;
      }
      // currently rounding average to an integer
      var averageElem = (
        <span className="SummaryGroup-option-count">
          {Math.round(average)}
        </span>
      );

      var totalElem = (
        <span className="SummaryGroup-option-total">
          <span>Total:</span>
          {value}
        </span>
      );

      return (
        <div key={option.key} className={classes}
          onClick={this.handleSelectSubtotal.bind(this, option)}>
          <span className="SummaryGroup-option-label">{option.label}</span>
          {averageElem}
          {totalElem}
        </div>
      );
    }
    else {
      var percentage;
      if (option.percentage) {
        if (path) {
          percentage = this.props.data[path][option.key].percentage;
        }
        else {
          percentage = this.props.data[option.key].percentage;
        }
      }

      var percentageElem = (option.percentage) ? (
        <span className="SummaryGroup-option-percentage">
          ({format.percentage(percentage)})
        </span>
      ) : null;

      var valueElem = (
        <span className="SummaryGroup-option-count">
          {value}
          {percentageElem}
        </span>
      );

      var labels = this.labelGenerator({
        bgClasses: this.props.bgClasses,
        bgUnits: this.props.bgUnits
      });

      var labelOpts = option.labelOpts;

      var labelText = option.label ? option.label :
        labels[labelOpts.type][labelOpts.key];

      var labelElem = (
        <span className="SummaryGroup-option-label">{labelText}</span>
      );

      return (
        <div key={option.key} className={classes}
          onClick={this.handleSelectSubtotal.bind(this, option)}>
          {labelElem}
          {valueElem}
        </div>
      );
    }
  },

  handleSelectSubtotal: function(selected) {
    if (selected.disabled) {
      return;
    }
    this.actions.selectSubtotal(this.props.sectionId, selected.key, this.props.trackMetric);
  },
});

module.exports = SummaryGroup;
