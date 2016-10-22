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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions/';
import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';

export class PumpSettingsContainer extends React.Component {
  static propTypes = {
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    children: PropTypes.element.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    deviceKey: PropTypes.oneOf(['animas', 'carelink', 'insulet', 'medtronic', 'tandem']).isRequired,
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
  }

  componentWillMount() {
    const { markSettingsViewed } = this.props;
    const { deviceKey, pumpSettings: { activeSchedule }, toggleSettingsSection } = this.props;
    const { settingsState: { touched } } = this.props;
    if (!touched) {
      markSettingsViewed();
      toggleSettingsSection(deviceKey, activeSchedule);
    }
  }

  render() {
    return this.props.children;
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
  (stateProps, dispatchProps, ownProps) => (_.assign({}, ownProps, stateProps, dispatchProps)),
)(PumpSettingsContainer);
