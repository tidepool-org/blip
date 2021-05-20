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

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';

import * as constants from '../../logic/constants';

import basicsActions from '../../logic/actions';

class Selector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="SiteChangeSelector">
        {this.renderMessage()}
        {this.renderOptions()}
      </div>
    );
  }

  renderMessage() {
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
  }

  renderOptions() {
    var {
      canUpdateSettings,
      hasSiteChangeSourceSettings,
    } = this.props.selectorMetaData;

    if (!canUpdateSettings && hasSiteChangeSourceSettings) {
      return;
    }

    var optionRows = this.props.selectorOptions.rows;

    return optionRows.map((row, id) => {
      var options = row.map(this.renderOption);
      return (
        <div key={'row-'+id} className="SummaryGroup-row">
          {options}
        </div>
      );
    });
  }

  renderOption = (option) => {
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
  }

  subAction(pump, action) {
    const t = i18next.t.bind(i18next);
    const pumpVocabulary = {
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
      [constants.DIABELOOP]: {
        [constants.SITE_CHANGE_RESERVOIR]: t('Change Cartridge'),
        [constants.SITE_CHANGE_TUBING]: t('Fill Tubing'),
        [constants.SITE_CHANGE_CANNULA]: t('Fill Cannula'),
        [constants.AUTOMATED_DELIVERY]: t('Loop mode'),
        [constants.SCHEDULED_DELIVERY]: t('Loop mode off'),
      },
      default: {
        [constants.SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
        [constants.SITE_CHANGE_TUBING]: 'Fill Tubing',
        [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
      }
    };

    if (pump in pumpVocabulary) {
      return (
        <strong key={action}>{pumpVocabulary[pump][action]}</strong>
      );
    }

    return (
      <strong key={action}>{pumpVocabulary.default[action]}</strong>
    );
  }

  handleSelectSubtotal = (selectedSubtotal, optionLabel) => {
    basicsActions.setSiteChangeEvent(this.props.sectionId, selectedSubtotal, optionLabel, this.props.trackMetric, this.props.updateBasicsSettings);
  }
}

Selector.propTypes = {
  data: PropTypes.object,
  selectedSubtotal: PropTypes.string.isRequired,
  selectorOptions: PropTypes.object.isRequired,
  selectorMetaData: PropTypes.object.isRequired,
  updateBasicsSettings: PropTypes.func.isRequired,
  sectionId: PropTypes.string.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default Selector;
