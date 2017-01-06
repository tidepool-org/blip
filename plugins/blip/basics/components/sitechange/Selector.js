/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2017 Tidepool Project
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
var React = require('react');
var cx = require('classnames');

var basicsActions = require('../../logic/actions');
var BasicsUtils = require('../BasicsUtils');

var constants = require('../../logic/constants');

var Selector = React.createClass({
  mixins: [BasicsUtils],
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    data: React.PropTypes.object,
    selectedSubtotal: React.PropTypes.string.isRequired,
    selectorOptions: React.PropTypes.object.isRequired,
    updateBasicsSettings: React.PropTypes.func.isRequired,
    sectionId: React.PropTypes.string.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },
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
      <div className="SiteChangeSelector">
        {others}
      </div>
    );
  },
  renderOption: function(option) {
    var optionClass = cx({
      'SiteChangeSelector-option': true,
      'SiteChangeSelector-option--cannula': (option.key === constants.SITE_CHANGE_CANNULA),
      'SiteChangeSelector-option--tubing': (option.key === constants.SITE_CHANGE_TUBING),
      'SiteChangeSelector-option--selected': (option.key === this.props.selectedSubtotal),
    });

    return (
      <label key={option.key} className={optionClass}>
        <input type="radio" name="site_change_event" value={option.key} onChange={this.handleSelectSubtotal.bind(null, option.key, option.label)} checked={option.key === this.props.selectedSubtotal} />
        {option.label}
      </label>
    );
  },
  handleSelectSubtotal: function(selectedSubtotal, optionLabel) {
    basicsActions.setSiteChangeEvent(this.props.sectionId, selectedSubtotal, optionLabel, this.props.trackMetric, this.props.updateBasicsSettings);
  }
});

module.exports = Selector;
