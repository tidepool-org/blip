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
