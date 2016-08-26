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
import Table from '../../../components/common/Table';
import CollapsibleContainer from '../../common/CollapsibleContainer';

import * as common from '../common';
import * as dataProcessing from '../dataProcessing';

import styles from './Medtronic.css';

const Medtronic = (props) => {
  const { bgUnits, pumpSettings } = props;

  const renderBasalsData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'rate', label: 'Value (U/hr)', className: '' },
    ];
    const schedules = common.getScheduleNames(pumpSettings.basalSchedules);

    const tables = schedules.map((schedule) => {
      const title = {
        label: common.getScheduleLabel(
          pumpSettings.basalSchedules[schedule].name,
          pumpSettings.activeSchedule,
        ),
        className: styles.basalSchedulesHeader,
      };

      return (
        <div key={schedule}>
          <CollapsibleContainer
            styledLabel={title}
            openByDefault={
              pumpSettings.basalSchedules[schedule].name === pumpSettings.activeSchedule
            }
            openedStyle={styles.collapsibleOpened}
            closedStyle={styles.collapsibleClosed}
          >
            <Table
              rows={
                dataProcessing.processBasalRateData(pumpSettings.basalSchedules[schedule])
              }
              columns={columns}
              tableStyle={styles.basalTable}
            />
          </CollapsibleContainer>
        </div>
      );
    });
    return (<div className={styles.block}>{tables}</div>);
  };

  const renderSensitivityData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'amount', label: `Value (${bgUnits}/U)`, className: '' },
    ];
    const title = {
      label: 'Sensitivity',
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            dataProcessing.processSensitivityData(
              pumpSettings.insulinSensitivity,
              bgUnits,
            )
          }
          columns={columns}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  };

  const renderRatioData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'amount', label: 'Value (g/U)', className: '' },
    ];
    const title = {
      label: 'Carb Ratios',
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            dataProcessing.processCarbRatioData(
              pumpSettings.carbRatio,
            )
          }
          columns={columns}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  };

  const renderTargetData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'columnTwo', label: 'Low', className: '' },
      { key: 'columnThree', label: 'High', className: '' },
    ];
    const title = {
      label: `BG Target (${bgUnits})`,
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            dataProcessing.processBgTargetData(
              pumpSettings.bgTarget,
              bgUnits,
              { columnTwo: 'low', columnThree: 'high' },
            )
          }
          columns={columns}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  };

  return (
    <div>
      <Header
        deviceType="Medtronic"
        deviceMeta={common.getDeviceMeta(pumpSettings)}
      />
      <div className={styles.settings}>
        {renderBasalsData()}
        {renderSensitivityData()}
        {renderTargetData()}
        {renderRatioData()}
      </div>
    </div>
  );
};

Medtronic.propTypes = {
  bgUnits: PropTypes.oneOf([common.MMOLL_UNITS, common.MGDL_UNITS]).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
Medtronic.defaultProps = {
  bgUnits: common.MGDL_UNITS,
};

export default Medtronic;
