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

import styles from './Tandem.css';

import Table from '../../../components/common/Table';
import Header from '../header/Header';
import * as common from '../common';

const Tandem = (props) => {
  const { bgUnits, pumpSettings } = props;

  const schedules = common.getScheduleNames(pumpSettings.basalSchedules);

  const getScheduleData = (scheduleName) => {
    const starts = pumpSettings.basalSchedules[scheduleName].map(s => s.start);

    return starts.map((startTime) => (
      { start: common.getTime(
          pumpSettings.basalSchedules[scheduleName],
          startTime,
        ),
        rate: common.getBasalRate(
          pumpSettings.basalSchedules[scheduleName],
          startTime,
        ),
        bgTarget: common.getBloodGlucoseValue(
          pumpSettings.bgTargets[scheduleName],
          'target',
          startTime,
          bgUnits,
        ),
        carbRatio: common.getValue(
          pumpSettings.carbRatios[scheduleName],
          'amount',
          startTime,
        ),
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
    <div>
      <Header
        deviceType="Tandem"
        deviceMeta={common.getDeviceMeta(pumpSettings)}
      />
      {tables}
    </div>
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
