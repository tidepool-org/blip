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

import Header from './common/Header';
import Table from './common/Table';
import CollapsibleContainer from './common/CollapsibleContainer';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import * as data from '../../utils/settings/data';

import styles from './NonTandem.css';

const BG_TARGET_COLS_BY_MANUFACTURER = {
  animas: [
    { key: 'start', label: 'Start time' },
    { key: 'columnTwo', label: 'Target' },
    { key: 'columnThree', label: 'Range' },
  ],
  insulet: [
    { key: 'start', label: 'Start time' },
    { key: 'columnTwo', label: 'Target' },
    { key: 'columnThree', label: 'Correct Above' },
  ],
  medtronic: [
    { key: 'start', label: 'Start time' },
    { key: 'columnTwo', label: 'Low' },
    { key: 'columnThree', label: 'High' },
  ],
};
const BG_TARGET_BY_MANUFACTURER = {
  animas: 'BG Target',
  insulet: 'Target BG',
  medtronic: 'BG Target',
};
const ISF_BY_MANUFACTURER = {
  animas: 'ISF',
  insulet: 'Correction factor',
  medtronic: 'Sensitivity',
};
const CARB_RATIO_BY_MANUFACTURER = {
  animas: 'I:C Ratio',
  insulet: 'IC ratio',
  medtronic: 'Carb Ratios',
};
const BOLUS_SETTINGS_LABEL_BY_MANUFACTURER = {
  animas: 'ezCarb ezBG',
  insulet: 'Bolus Calculator',
  medtronic: 'Bolus Wizard',
};
const DEVICE_DISPLAY_NAME_BY_MANUFACTURER = {
  animas: 'Animas',
  insulet: 'OmniPod',
  medtronic: 'Medtronic',
};

const NonTandem = (props) => {
  const {
    bgUnits,
    manufacturerKey,
    openedSections,
    pumpSettings,
    timePrefs,
    toggleBasalScheduleExpansion,
  } = props;

  let lookupKey = manufacturerKey;

  if (manufacturerKey === 'carelink') {
    lookupKey = 'medtronic';
  }

  function renderBasalsData() {
    const schedules = data.getScheduleNames(pumpSettings.basalSchedules);

    const tables = _.map(schedules, (schedule) => {
      let scheduleName = pumpSettings.basalSchedules[schedule].name;
      if (lookupKey === 'medtronic') {
        scheduleName = _.map(scheduleName.split(' '), (part) => (_.capitalize(part))).join(' ');
      }
      const label = data.getScheduleLabel(
        scheduleName,
        pumpSettings.activeSchedule,
      );
      const scheduledIsExpanded = _.get(openedSections, scheduleName, false);
      const toggleFn = _.partial(toggleBasalScheduleExpansion, scheduleName);

      if (scheduleName === pumpSettings.activeSchedule) {
        return (
          <div className={styles.categoryContainer} key={schedule}>
            <CollapsibleContainer
              label={label}
              labelClass={styles.twoLineBasalScheduleHeader}
              opened={scheduledIsExpanded}
              toggleExpansion={toggleFn}
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
            opened={scheduledIsExpanded}
            toggleExpansion={toggleFn}
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
  }

  function renderSensitivityData() {
    const title = {
      label: {
        main: ISF_BY_MANUFACTURER[lookupKey],
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
  }

  function renderRatioData() {
    const title = {
      label: {
        main: CARB_RATIO_BY_MANUFACTURER[lookupKey],
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
  }

  function renderTargetData() {
    const title = {
      label: {
        main: BG_TARGET_BY_MANUFACTURER[lookupKey],
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
          columns={BG_TARGET_COLS_BY_MANUFACTURER[lookupKey]}
          tableStyle={styles.settingsTable}
        />
      </div>
    );
  }

  return (
    <div>
      <Header
        deviceDisplayName={DEVICE_DISPLAY_NAME_BY_MANUFACTURER[lookupKey]}
        deviceMeta={data.getDeviceMeta(pumpSettings, timePrefs)}
      />
      <div className={styles.settingsContainer}>
        <div className={styles.basalSettingsContainer}>
          <div className={styles.categoryTitle}>Basal Rates</div>
          {renderBasalsData()}
        </div>
        <div>
          <div className={styles.categoryTitle}>
            {BOLUS_SETTINGS_LABEL_BY_MANUFACTURER[lookupKey]}
          </div>
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
  bgUnits: PropTypes.oneOf([MMOLL_UNITS, MGDL_UNITS]).isRequired,
  manufacturerKey: PropTypes.oneOf(['animas', 'carelink', 'insulet', 'medtronic']),
  openedSections: PropTypes.object.isRequired,
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
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool.isRequired,
    timezoneName: PropTypes.oneOfType([PropTypes.string, null]),
  }).isRequired,
  toggleBasalScheduleExpansion: PropTypes.func.isRequired,
};

export default NonTandem;
