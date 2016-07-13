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
