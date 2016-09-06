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

import Header from '../common/Header';
import Table from '../common/Table';
import CollapsibleContainer from '../common/CollapsibleContainer';

import * as utilities from '../data/utilities';
import * as processing from '../data/processing';

import styles from './Omnipod.css';

const Omnipod = (props) => {
  const { bgUnits, pumpSettings } = props;

  const renderBasalsData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'rate', label: 'Value (U/hr)', className: '' },
    ];
    const schedules = utilities.getScheduleNames(pumpSettings.basalSchedules);

    const tables = schedules.map((schedule) => {
      const title = {
        label: utilities.getScheduleLabel(
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
                processing.processBasalRateData(pumpSettings.basalSchedules[schedule])
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
      label: 'Correction factor',
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            processing.processSensitivityData(
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
      label: 'IC ratio',
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            processing.processCarbRatioData(
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
      { key: 'columnTwo', label: 'Target', className: '' },
      { key: 'columnThree', label: 'Correct Above', className: '' },
    ];
    const title = {
      label: `Target BG (${bgUnits})`,
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            processing.processBgTargetData(
              pumpSettings.bgTarget,
              bgUnits,
              { columnTwo: 'target', columnThree: 'high' },
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
        deviceType="Omnipod"
        deviceMeta={utilities.getDeviceMeta(pumpSettings)}
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

Omnipod.propTypes = {
  bgUnits: PropTypes.oneOf([utilities.MMOLL_UNITS, utilities.MGDL_UNITS]).isRequired,
  pumpSettings: processing.settingsShape.isRequired,
};

export default Omnipod;
