/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import _ from 'lodash';
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ClipboardButton from 'react-clipboard.js';

import * as actions from '../../redux/actions/';
import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';

import NonTandem from '../../components/settings/NonTandem';
import Tandem from '../../components/settings/Tandem';
import { COPY_VIEW, DISPLAY_VIEW, PRINT_VIEW } from '../../components/settings/constants';

import styles from './PumpSettingsContainer.css';

export class PumpSettingsContainer extends PureComponent {
  static propTypes = {
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    manufacturerKey: PropTypes.oneOf(
      ['animas', 'carelink', 'insulet', 'medtronic', 'tandem']
    ).isRequired,
    markSettingsViewed: PropTypes.func.isRequired,
    // see more specific schema in NonTandem and Tandem components!
    pumpSettings: PropTypes.shape({
      activeSchedule: PropTypes.string.isRequired,
    }).isRequired,
    timePrefs: PropTypes.shape({
      timezoneAware: PropTypes.bool.isRequired,
      timezoneName: PropTypes.string.isRequired,
    }).isRequired,
    settingsState: PropTypes.object.isRequired,
    toggleSettingsSection: PropTypes.func.isRequired,
    view: PropTypes.oneOf([COPY_VIEW, DISPLAY_VIEW, PRINT_VIEW]).isRequired,
  }

  componentWillMount() {
    const { markSettingsViewed } = this.props;
    const { manufacturerKey, pumpSettings: { activeSchedule }, toggleSettingsSection } = this.props;
    const { settingsState: { touched } } = this.props;
    if (!touched) {
      markSettingsViewed();
      toggleSettingsSection(manufacturerKey, activeSchedule);
    }
  }

  render() {
    const { settingsState } = this.props;
    if (_.isEmpty(settingsState)) {
      return null;
    }
    const {
      bgUnits,
      manufacturerKey,
      pumpSettings,
      timePrefs,
      toggleSettingsSection,
      view,
    } = this.props;
    const supportedNonTandemPumps = ['animas', 'carelink', 'insulet', 'medtronic'];
    const toggleFn = _.partial(toggleSettingsSection, manufacturerKey);
    if (manufacturerKey === 'tandem') {
      const settings = (
        <Tandem
          bgUnits={bgUnits}
          deviceKey={manufacturerKey}
          openedSections={settingsState[manufacturerKey]}
          pumpSettings={pumpSettings}
          timePrefs={timePrefs}
          toggleProfileExpansion={toggleFn}
          view={view}
        />
      );
      if (view === PRINT_VIEW) {
        return (
          <div>
            {settings}
          </div>
        );
      }

      const copy = (
        <div className={styles.copySchedule} id="copySchedule">
          <Tandem
            bgUnits={bgUnits}
            deviceKey={manufacturerKey}
            openedSections={settingsState[manufacturerKey]}
            pumpSettings={pumpSettings}
            timePrefs={timePrefs}
            toggleProfileExpansion={toggleFn}
            view={COPY_VIEW}
          />
        </div>
      );

      return (
        <div>
          <ClipboardButton
            className={styles.copyButton}
            button-title="For email or notes"
            data-clipboard-target="#copySchedule"
          >
            <p>Copy as text</p>
          </ClipboardButton>
          {settings}
          {copy}
        </div>
      );
    } else if (_.includes(supportedNonTandemPumps, manufacturerKey)) {
      const settings = (
        <NonTandem
          bgUnits={bgUnits}
          deviceKey={manufacturerKey}
          openedSections={settingsState[manufacturerKey]}
          pumpSettings={pumpSettings}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={toggleFn}
          view={view}
        />
      );
      if (view === PRINT_VIEW) {
        return (
          <div>
            {settings}
          </div>
        );
      }

      const copy = (
        <div className={styles.copySchedule} id="copySchedule">
          <NonTandem
            bgUnits={bgUnits}
            deviceKey={manufacturerKey}
            openedSections={settingsState[manufacturerKey]}
            pumpSettings={pumpSettings}
            timePrefs={timePrefs}
            toggleBasalScheduleExpansion={toggleFn}
            view={COPY_VIEW}
          />
        </div>
      );

      return (
        <div>
          <ClipboardButton
            className={styles.copyButton}
            button-title="For email or notes"
            data-clipboard-target="#copySchedule"
          >
            <p>Copy as text</p>
          </ClipboardButton>
          {settings}
          {copy}
        </div>
      );
    }
    // eslint-disable-next-line no-console
    console.warn(`Unknown manufacturer key: [${manufacturerKey}]!`);
    return null;
  }
}

export function mapStateToProps(state, ownProps) {
  const userId = _.get(ownProps, 'currentPatientInViewId');
  return {
    settingsState: _.get(state, ['viz', 'settings', userId], {}),
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators({
    markSettingsViewed: _.partial(
      actions.markSettingsViewed, ownProps.currentPatientInViewId
    ),
    toggleSettingsSection: _.partial(
      actions.toggleSettingsSection, ownProps.currentPatientInViewId
    ),
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PumpSettingsContainer);
