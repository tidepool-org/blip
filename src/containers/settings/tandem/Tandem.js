import React, { PropTypes } from 'react';
import _ from 'lodash';

import Table from '../../../components/settings/Table';
import * as datetime from '../../../utils/datetime';

import styles from './Tandem.css';

const Tandem = (props) => {
  const { bgUnits, pumpSettings } = props;

  const schedules = _.keysIn(pumpSettings.basalSchedules);

  const getScheduleData = (scheduleName) => {
    const starts = pumpSettings.basalSchedules[scheduleName].map(s => s.start);

    return starts.map((startTime) => (
      { start: datetime.millisecondsAsTimeOfDay(pumpSettings
          .basalSchedules[scheduleName]
          .filter(s => s.start === startTime)
          .map(s => s.start)),
        rate: pumpSettings.
          basalSchedules[scheduleName]
          .filter(s => s.start === startTime)
          .map(s => s.rate),
        bgTarget: pumpSettings
          .bgTargets[scheduleName]
          .filter(s => s.start === startTime)
          .map(s => s.target),
        carbRatio: pumpSettings
          .carbRatios[scheduleName]
          .filter(s => s.start === startTime)
          .map(s => s.amount),
        insulinSensitivity: pumpSettings
          .insulinSensitivities[scheduleName]
          .filter(s => s.start === startTime)
          .map(s => s.amount) }
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
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
Tandem.defaultProps = {
  bgUnits: 'mg/dL',
};

export default Tandem;
