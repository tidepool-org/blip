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

import Header from '../header/Header';
import * as common from '../common';
import * as commonTables from '../commonTables';

import styles from './Omnipod.css';

const Omnipod = (props) => {
  const { bgUnits, pumpSettings } = props;

  const basalColumns = [
    { key: 'start', label: 'Start time', className: '' },
    { key: 'rate', label: 'Value (U/hr)', className: '' },
  ];
  const sensitivityColumns = [
    { key: 'start', label: 'Start time', className: '' },
    { key: 'amount', label: `Value (${bgUnits}/U)`, className: '' },
  ];
  const sensitivityTitle = {
    label: 'Correction factor',
    className: styles.bolusSettingsHeader,
  };
  const ratioColumns = [
    { key: 'start', label: 'Start time', className: '' },
    { key: 'amount', label: 'Value (g/U)', className: '' },
  ];
  const ratioTitle = {
    label: 'IC ratio',
    className: styles.bolusSettingsHeader,
  };
  const bgTargetsColumns = [
    { key: 'start', label: 'Start time', className: '' },
    { key: 'low', label: 'Low', className: '' },
    { key: 'high', label: 'High', className: '' },
  ];
  const bgTargetsTitle = { label: `Target BG (${bgUnits})`, className: styles.bolusSettingsHeader };

  return (
    <div>
      <Header
        deviceType="Omnipod"
        deviceMeta={common.getDeviceMeta(pumpSettings)}
      />
      <div className={styles.settings}>
        {
          commonTables.buildBasalRateTables(
            styles.basalSchedulesHeader,
            basalColumns,
            pumpSettings.basalSchedules,
          )
        }
        {
          commonTables.buildSensitivityTable(
            sensitivityTitle,
            sensitivityColumns,
            pumpSettings.insulinSensitivity,
            bgUnits,
          )
        }
        {
          commonTables.buildBgTargetTable(
            bgTargetsTitle,
            bgTargetsColumns,
            pumpSettings.bgTarget,
            bgUnits,
          )
        }
        {
          commonTables.buildCarbRatioTable(
            ratioTitle,
            ratioColumns,
            pumpSettings.carbRatio,
          )
        }
      </div>
    </div>
  );
};

Omnipod.propTypes = {
  bgUnits: PropTypes.oneOf([common.MMOLL_UNITS, common.MGDL_UNITS]).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
Omnipod.defaultProps = {
  bgUnits: common.MGDL_UNITS,
};

export default Omnipod;
