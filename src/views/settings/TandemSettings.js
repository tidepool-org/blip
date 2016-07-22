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

import React, { PropTypes } from 'react';

import TimedSettings from '../../components/settings/TimedSettings';

const TandemSettings = (props) => {
  const { bgUnits, pumpSettings } = props;
  return (
    <TimedSettings
      bgUnits={bgUnits}
      basalSchedules={pumpSettings.basalSchedules}
      bgTargets={pumpSettings.bgTargets}
      insulinCarbRatios={pumpSettings.insulinCarbRatios}
      insulinSensitivities={pumpSettings.insulinSensitivities}
    />
  );
};

TandemSettings.propTypes = {
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
TimedSettings.defaultProps = {
  bgUnits: 'mg/dL',
};

export default TandemSettings;
