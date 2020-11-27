
/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { translate } from 'react-i18next';

import { components } from '@tidepool/viz';
const RangeSelect = components.RangeSelect;

var TidelineFooter = translate()(class extends React.Component {
  static propTypes = {
    chartType: PropTypes.string.isRequired,
    onClickBoxOverlay: PropTypes.func,
    onClickGroup: PropTypes.func,
    onClickLines: PropTypes.func,
    onClickValues: PropTypes.func,
    onClickRefresh: PropTypes.func,
    boxOverlay: PropTypes.bool,
    grouped: PropTypes.bool,
    showingLines: PropTypes.bool,
    showingCbg: PropTypes.bool,
    showingSmbg: PropTypes.bool,
    showingValues: PropTypes.bool,
    displayFlags: PropTypes.object,
    currentPatientInViewId: PropTypes.string,
  };

  render() {
    const { t } = this.props;
    var refreshLinkClass = cx({
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var showValues = (
      <div className="footer-right-options">
        <label htmlFor="valuesCheckbox">
          <input type="checkbox" name="valuesCheckbox" id="valuesCheckbox"
            checked={this.props.showingValues}
            onChange={this.props.onClickValues} /> {t('Values')}
        </label>
      </div>
    );

    var trendsOpts = (
      <div className="footer-right-options">
        <label htmlFor="overlayCheckbox">
          <input type="checkbox" name="overlayCheckbox" id="overlayCheckbox"
            checked={this.props.boxOverlay}
            onChange={this.props.onClickBoxOverlay} /> {t('Range & Average')}
        </label>

        <label htmlFor="groupCheckbox">
          <input type="checkbox" name="groupCheckbox" id="groupCheckbox"
            checked={this.props.grouped}
            onChange={this.props.onClickGroup} /> {t('Group')}
        </label>

        <label htmlFor="linesCheckbox">
          <input type="checkbox" name="linesCheckbox" id="linesCheckbox"
            checked={this.props.showingLines}
            onChange={this.props.onClickLines} /> {t('Lines')}
        </label>
      </div>
    );

    var rightSide = null;

    if (this.props.chartType === 'bgLog') {
      rightSide = showValues;
    }
    if (this.props.chartType === 'trends') {
      if (this.props.showingSmbg) {
        rightSide = trendsOpts;
      } else {
        rightSide = <RangeSelect
          displayFlags={this.props.displayFlags}
          currentPatientInViewId={this.props.currentPatientInViewId}
        />;
      }
    }

    return (
      <div className="container-box-outer patient-data-footer-outer">
        <div className="container-box-inner patient-data-footer-inner">
          <div className="patient-data-footer-left">
            <button className="btn btn-chart btn-refresh"
              onClick={this.props.onClickRefresh}>
              {t('Refresh')}</button>
          </div>
          <div className="patient-data-footer-right">{rightSide}</div>
        </div>
      </div>
    );
  }
});

export default TidelineFooter;
