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
import _ from 'lodash';

import Header from '../common/Header';
import Table from '../common/Table';
import CollapsibleContainer from '../common/CollapsibleContainer';

import * as constants from '../../../utils/constants';
import * as data from '../../../utils/settings/data';

import styles from './NonTandem.css';

const NonTandem = (props) => {
  const {
    bgTargetColumns,
    bgUnits,
    bolusSettingsLabel,
    deviceType,
    pumpSettings,
    timePrefs,
  } = props;

  const renderBasalsData = () => {
    const schedules = data.getScheduleNames(pumpSettings.basalSchedules);

    const tables = _.map(schedules, (schedule) => {
      const label = data.getScheduleLabel(
        pumpSettings.basalSchedules[schedule].name,
        pumpSettings.activeSchedule,
      );

      if (pumpSettings.basalSchedules[schedule].name === pumpSettings.activeSchedule) {
        return (
          <div className={styles.categoryContainer} key={schedule}>
            <CollapsibleContainer
              label={label}
              labelClass={styles.twoLineBasalScheduleHeader}
              openByDefault
              twoLineLabel
            >
              <Table
                rows={
                  data.processBasalRateData(pumpSettings.basalSchedules[schedule])
                }
                columns={data.startTimeAndValue('rate')}
                tableStyle={styles.basalTable}
              />
            </CollapsibleContainer>
          </div>
        );
      }
      return (
        <div className={styles.categoryContainer} key={schedule}>
          <CollapsibleContainer
            label={label}
            labelClass={styles.singleLineBasalScheduleHeader}
          >
            <Table
              rows={
                data.processBasalRateData(pumpSettings.basalSchedules[schedule])
              }
              columns={data.startTimeAndValue('rate')}
              tableStyle={styles.basalTable}
            />
          </CollapsibleContainer>
        </div>
      );
    });
    return (<div className={styles.categoryContainer}>{tables}</div>);
  };

  const renderSensitivityData = () => {
    const title = {
      label: {
        main: 'Correction factor',
        secondary: `${bgUnits}/U`,
      },
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.categoryContainer}>
        <Table
          title={title}
          rows={
            data.processSensitivityData(
              pumpSettings.insulinSensitivity,
              bgUnits,
            )
          }
          columns={data.startTimeAndValue('amount')}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  };

  const renderRatioData = () => {
    const title = {
      label: {
        main: 'IC ratio',
        secondary: 'g/U',
      },
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.categoryContainer}>
        <Table
          title={title}
          rows={
            data.processCarbRatioData(
              pumpSettings.carbRatio,
            )
          }
          columns={data.startTimeAndValue('amount')}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  };

  const renderTargetData = () => {
    const title = {
      label: {
        main: 'Target BG',
        secondary: bgUnits,
      },
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.categoryContainer}>
        <Table
          title={title}
          rows={
            data.processBgTargetData(
              pumpSettings.bgTarget,
              bgUnits,
              { columnTwo: 'target', columnThree: 'high' },
            )
          }
          columns={bgTargetColumns}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  };

  return (
    <div>
      <Header
        deviceType={deviceType}
        deviceMeta={data.getDeviceMeta(pumpSettings, timePrefs)}
      />
      <div className={styles.settingsContainer}>
        <div className={styles.basalSettingsContainer}>
          <div className={styles.categoryTitle}>Basal Rates</div>
          {renderBasalsData()}
        </div>
        <div>
          <div className={styles.categoryTitle}>{bolusSettingsLabel}</div>
          <div className={styles.bolusSettingsContainer}>
            {renderSensitivityData()}
            {renderTargetData()}
            {renderRatioData()}
          </div>
        </div>
      </div>
    </div>
  );
};

NonTandem.propTypes = {
  bgTargetColumns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  bgUnits: PropTypes.oneOf([constants.MMOLL_UNITS, constants.MGDL_UNITS]).isRequired,
  bolusSettingsLabel: PropTypes.string.isRequired,
  deviceType: PropTypes.string.isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool.isRequired,
    timezoneName: PropTypes.oneOfType([PropTypes.string, null]),
  }).isRequired,
  pumpSettings: PropTypes.shape({
    activeSchedule: PropTypes.string.isRequired,
    units: PropTypes.object.isRequired,
    deviceId: PropTypes.string.isRequired,
    basalSchedules: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.arrayOf(
          PropTypes.shape({
            start: PropTypes.number.isRequired,
            rate: PropTypes.number.isRequired,
          }),
        ),
      }),
    ).isRequired,
    bgTarget: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        target: PropTypes.number,
        range: PropTypes.number,
      })
    ).isRequired,
    carbRatio: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
      })
    ).isRequired,
    insulinSensitivity: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default NonTandem;
