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

import React from 'react';
import PropTypes from 'prop-types';

import { MGDL_UNITS, MMOLL_UNITS } from 'tideline';
import Diabeloop from '../Diabeloop';

class PumpSettingsContainer extends React.Component {
  static propTypes = {
    bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    copySettingsClicked: PropTypes.func.isRequired,
    manufacturerKey: PropTypes.oneOf(
      ['animas', 'carelink', 'insulet', 'medtronic', 'tandem', 'diabeloop']
    ).isRequired,
    pumpSettings: PropTypes.shape({
      deviceId: PropTypes.string.isRequired,
      deviceTime: PropTypes.string.isRequired,
      payload: PropTypes.object.isRequired,
    }).isRequired,
    timePrefs: PropTypes.shape({
      timezoneAware: PropTypes.bool.isRequired,
      timezoneName: PropTypes.string.isRequired,
    }).isRequired,
    onSwitchToDaily: PropTypes.func,
  }

  render() {
    const {
      copySettingsClicked,
      manufacturerKey,
      pumpSettings,
      timePrefs,
      onSwitchToDaily,
    } = this.props;

    return (
      <Diabeloop
        copySettingsClicked={copySettingsClicked}
        deviceKey={manufacturerKey}
        pumpSettings={pumpSettings}
        timePrefs={timePrefs}
        handleClickHistory={onSwitchToDaily}
      />
    );
  }
}

export default PumpSettingsContainer;
