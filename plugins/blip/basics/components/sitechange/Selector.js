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

/* jshint esversion:6 */

var _ = require('lodash');
var React = require('react');
var cx = require('classnames');

var basicsActions = require('../../logic/actions');
var BasicsUtils = require('../BasicsUtils');

var constants = require('../../logic/constants');

var Selector = React.createClass({
  mixins: [BasicsUtils],
  propTypes: {
    data: React.PropTypes.object,
    selectedSubtotal: React.PropTypes.string.isRequired,
    selectorOptions: React.PropTypes.object.isRequired,
    selectorMetaData: React.PropTypes.object.isRequired,
    updateBasicsSettings: React.PropTypes.func.isRequired,
    sectionId: React.PropTypes.string.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },
  render: function() {
    var self = this;

    return (
      <div className="SiteChangeSelector">
        {this.renderMessage()}
        {this.renderOptions()}
      </div>
    );
  },
  renderMessage: function() {
    if (!this.props.selectorMetaData.hasOwnProperty('latestPump')) {
      return;
    }

    var subAction;
    var message;
    var type = this.props.selectedSubtotal;
    var {
      latestPump,
      canUpdateSettings,
      hasSiteChangeSourceSettings,
      patientName,
    } = this.props.selectorMetaData;

    if (canUpdateSettings) {
      switch(type) {
        case constants.SITE_CHANGE_TUBING:
          message = [
            'We are using ',
            this.subAction(latestPump, constants.SITE_CHANGE_TUBING),
            ' to visualize your infusion site changes.'
          ];
          break;
        case constants.SITE_CHANGE_CANNULA:
          message = [
            'We are using ',
            this.subAction(latestPump, constants.SITE_CHANGE_CANNULA),
            ' to visualize your infusion site changes.'
          ];
          break;
        default:
          message = ['Please select how you would like to see infusion site changes:'];
          break;
      }
    }
    else {
      switch(type) {
        case constants.SITE_CHANGE_TUBING:
          subAction = this.subAction(latestPump, constants.SITE_CHANGE_TUBING);
          message = hasSiteChangeSourceSettings ? [
            patientName,
            ' is using ',
            subAction,
            ' to see infusion site changes.'
          ] : [
            'You are using ',
            subAction,
            ' to see infusion site changes for ',
            patientName,
          ];
          break;
        case constants.SITE_CHANGE_CANNULA:
          subAction = this.subAction(latestPump, constants.SITE_CHANGE_CANNULA);
          message = hasSiteChangeSourceSettings ? [
            patientName,
            ' is using ',
            subAction,
            ' to see infusion site changes.'
          ] : [
            'You are using ',
            subAction,
            ' to see infusion site changes for ',
            patientName,
          ];
          break;
        default:
          message = [
            patientName,
            ' has not selected how they would like to see infusion site changes.',
            ' Please select a temporary view option:'
          ];
          break;
        }
    }

    var messageClass = cx({
      'SiteChangeSelector-message': true,
      'SiteChangeSelector-message--disabled': (!canUpdateSettings),
      'SiteChangeSelector-message--cannula': (type === constants.SITE_CHANGE_CANNULA),
      'SiteChangeSelector-message--tubing': (type === constants.SITE_CHANGE_TUBING),
    });

    return (
      <p className={messageClass}>{message}</p>
    );
  },
  renderOptions: function() {
    var self = this;

    var {
      canUpdateSettings,
      hasSiteChangeSourceSettings,
    } = self.props.selectorMetaData;

    if (!canUpdateSettings && hasSiteChangeSourceSettings) {
      return;
    }

    var optionRows = self.props.selectorOptions.rows;

    return optionRows.map(function(row, id) {
      var options = row.map(self.renderOption);
      return (
        <div key={'row-'+id} className="SummaryGroup-row">
          {options}
        </div>
      );
    });
  },
  renderOption: function(option) {
    var optionClass = cx({
      'SiteChangeSelector-option': true,
      'SiteChangeSelector-option--cannula': (option.key === constants.SITE_CHANGE_CANNULA),
      'SiteChangeSelector-option--tubing': (option.key === constants.SITE_CHANGE_TUBING),
      'SiteChangeSelector-option--selected': (option.key === this.props.selectedSubtotal),
    });

    var latestPump = 'default';
    if (this.props.selectorMetaData.hasOwnProperty('latestPump')) {
      latestPump = this.props.selectorMetaData.latestPump;
    }

    return (
      <label key={option.key} className={optionClass}>
        <input type="radio" name="site_change_event" value={option.key} onChange={this.handleSelectSubtotal.bind(null, option.key, option.label)} checked={option.key === this.props.selectedSubtotal} />
        {this.subAction(latestPump, option.key)}
      </label>
    );
  },
  subAction: function(pump, action) {
    var pumpVocabulary = {
      [constants.ANIMAS]: {
        [constants.SITE_CHANGE_RESERVOIR]: 'Go Rewind',
        [constants.SITE_CHANGE_TUBING]: 'Go Prime',
        [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
      },
      [constants.INSULET]: {
        [constants.SITE_CHANGE_RESERVOIR]: 'Change Pod',
        [constants.SITE_CHANGE_TUBING]: 'Activate Pod',
        [constants.SITE_CHANGE_CANNULA]: 'Prime',
      },
      [constants.MEDTRONIC]: {
        [constants.SITE_CHANGE_RESERVOIR]: 'Rewind',
        [constants.SITE_CHANGE_TUBING]: 'Prime',
        [constants.SITE_CHANGE_CANNULA]: 'Prime Cannula',
      },
      [constants.TANDEM]: {
        [constants.SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
        [constants.SITE_CHANGE_TUBING]: 'Fill Tubing',
        [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
      },
      default: {
        [constants.SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
        [constants.SITE_CHANGE_TUBING]: 'Fill Tubing',
        [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
      }
    };

    if (pumpVocabulary.hasOwnProperty(pump)) {
      return (
        <strong key={action}>{pumpVocabulary[pump][action]}</strong>
      );
    }

    return (
      <strong key={action}>{pumpVocabulary.default[action]}</strong>
    );
  },
  handleSelectSubtotal: function(selectedSubtotal, optionLabel) {
    basicsActions.setSiteChangeEvent(this.props.sectionId, selectedSubtotal, optionLabel, this.props.trackMetric, this.props.updateBasicsSettings);
  }
});

module.exports = Selector;
