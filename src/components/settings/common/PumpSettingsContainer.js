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
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../../redux/actions/';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../utils/constants';
import NonTandem from '../NonTandem';
import Tandem from '../Tandem';
import Diabeloop from '../Diabeloop';

export class PumpSettingsContainer extends React.PureComponent {
  static propTypes = {
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    copySettingsClicked: PropTypes.func.isRequired,
    manufacturerKey: PropTypes.oneOf(
      ['animas', 'carelink', 'insulet', 'medtronic', 'tandem', 'diabeloop']
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
    onSwitchToDaily: PropTypes.func,
  }

  componentWillMount() {
    const { markSettingsViewed } = this.props;
    const {
      manufacturerKey,
      pumpSettings: { activeSchedule, lastManualBasalSchedule },
      toggleSettingsSection,
      settingsState: { touched },
    } = this.props;

    if (!touched) {
      markSettingsViewed();
      toggleSettingsSection(manufacturerKey, lastManualBasalSchedule || activeSchedule);
    }
  }

  render() {
    const { settingsState, user } = this.props;
    if (_.isEmpty(settingsState)) {
      return null;
    }
    const {
      bgUnits,
      copySettingsClicked,
      manufacturerKey,
      pumpSettings,
      timePrefs,
      toggleSettingsSection,
    } = this.props;

    const toggleFn = _.partial(toggleSettingsSection, manufacturerKey);

    switch (manufacturerKey) {
      case 'tandem':
        return (
          <Tandem
            bgUnits={bgUnits}
            copySettingsClicked={copySettingsClicked}
            deviceKey={manufacturerKey}
            openedSections={settingsState[manufacturerKey]}
            pumpSettings={pumpSettings}
            timePrefs={timePrefs}
            toggleProfileExpansion={toggleFn}
            user={user}
          />
        );
      case 'diabeloop':

        return (
          <Diabeloop
            copySettingsClicked={copySettingsClicked}
            deviceKey={manufacturerKey}
            pumpSettings={pumpSettings}
            timePrefs={timePrefs}
            user={user}
            handleClickHistory={(dateTime, title) => this.props.onSwitchToDaily(dateTime, title)}
          />
        );
      case 'animas':
      case 'carelink':
      case 'insulet':
      case 'medtronic':
        return (
          <NonTandem
            bgUnits={bgUnits}
            copySettingsClicked={copySettingsClicked}
            deviceKey={manufacturerKey}
            openedSections={settingsState[manufacturerKey]}
            pumpSettings={pumpSettings}
            timePrefs={timePrefs}
            toggleBasalScheduleExpansion={toggleFn}
            user={user}
          />
        );
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown manufacturer key: [${manufacturerKey}]!`);
        return null;
    }
  }
}

export function mapStateToProps(state, ownProps) {
  const userId = _.get(ownProps, 'currentPatientInViewId');
  const user = _.get(
    state.blip.allUsersMap,
    userId,
    {},
  );
  return {
    settingsState: _.get(state, ['viz', 'settings', userId], {}),
    user,
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
