import React, { PropTypes } from 'react';

import styles from './TimedSettings.css';

const TimedSettings = (props) => {
  const { bgUnits } = props;

  const COLUMN_LABELS = {
    start: 'Start time',
    basalSchedules: 'Basal Rates',
    bgTargets: 'BG Target',
    insulinCarbRatios: 'Insulin : Carb',
    insulinSensitivities: 'Sensitivity',
  };

  const COLUMN_UNITS = {
    basalSchedules: 'U/hr',
    bgTargets: bgUnits,
    insulinCarbRatios: 'g',
    insulinSensitivities: `${bgUnits}/U`,
  };

  const columnLabel = (key) => (`${COLUMN_LABELS[key]} (${COLUMN_UNITS[key]})`);

  return (
    <table>
      <colgroup>
        <col id="start" span="1" />
        <col id="basalSchedules" span="1" />
        <col id="other" span="3" />
      </colgroup>
      <thead>
        <tr>
          <th>
            {COLUMN_LABELS.start}
          </th>
          <th className={styles.basalSchedulesHeader}>
            {columnLabel('basalSchedules')}
          </th>
          <th className={styles.bolusSettingsHeader}>
            {columnLabel('bgTargets')}
          </th>
          <th className={styles.bolusSettingsHeader}>
            {columnLabel('insulinCarbRatios')}
          </th>
          <th className={styles.bolusSettingsHeader}>
            {columnLabel('insulinSensitivities')}
          </th>
        </tr>
      </thead>
    </table>
  );
};

TimedSettings.propTypes = {
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  basalSchedules: PropTypes.object.isRequired,
  bgTargets: PropTypes.object.isRequired,
  insulinCarbRatios: PropTypes.object.isRequired,
  insulinSensitivities: PropTypes.object.isRequired,
};

export default TimedSettings;
