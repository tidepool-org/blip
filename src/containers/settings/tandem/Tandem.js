import React, { PropTypes } from 'react';

import styles from './Tandem.css';

import Table from '../../../components/common/Table';
import * as common from '../common';

const Tandem = (props) => {
  const { bgUnits, pumpSettings } = props;

  const schedules = _.keysIn(pumpSettings.basalSchedules);

  const getScheduleData = (scheduleName) => {
    const starts = pumpSettings.basalSchedules[scheduleName].map(s => s.start);

    return starts.map((startTime) => (
      { start: common.getTime(
          pumpSettings.basalSchedules[scheduleName],
          startTime,
        ),
        rate: common.getRate(
          pumpSettings.basalSchedules[scheduleName],
          startTime,
        ),
        bgTarget: common.getBloodGlucoseValue(
          pumpSettings.bgTargets[scheduleName],
          'target',
          startTime,
          bgUnits,
        ),
        carbRatio: pumpSettings
          .carbRatios[scheduleName]
          .filter(s => s.start === startTime)
          .map(s => s.amount),
        insulinSensitivity: common.getBloodGlucoseValue(
          pumpSettings.insulinSensitivities[scheduleName],
          'amount',
          startTime,
          bgUnits,
        ),
      }
    ));
  };

  const COLUMNS = [
    { key: 'start',
      label: 'Start time',
      className: '' },
    { key: 'rate',
      label: 'Basal Rates (U/hr)',
      className: styles.basalSchedulesHeader },
    { key: 'bgTarget',
      label: `BG Target (${bgUnits})`,
      className: styles.bolusSettingsHeader },
    { key: 'carbRatio',
      label: 'Insulin : Carb (g)',
      className: styles.bolusSettingsHeader },
    { key: 'insulinSensitivity',
      label: `Sensitivity (${bgUnits}/U)`,
      className: styles.bolusSettingsHeader },
  ];

  const tables = schedules.map((schedule) => (
    <div>
      <h3>{schedule}</h3>
      <Table
        rows={getScheduleData(schedule)}
        columns={COLUMNS}
      />
    </div>
  ));

  return (
    <div>{tables}</div>
  );
};

Tandem.propTypes = {
  bgUnits: PropTypes.oneOf([common.MMOLL_UNITS, common.MGDL_UNITS]).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
Tandem.defaultProps = {
  bgUnits: common.MGDL_UNITS,
};

export default Tandem;
