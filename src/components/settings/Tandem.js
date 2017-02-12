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

import styles from './Tandem.css';

import Header from './common/Header';
import Table from './common/Table';
import CollapsibleContainer from './common/CollapsibleContainer';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import * as data from '../../utils/settings/data';

const Tandem = (props) => {
  const {
    bgUnits,
    deviceKey,
    openedSections,
    pumpSettings,
    timePrefs,
    toggleProfileExpansion,
    printView,
  } = props;

  const schedules = data.getTimedSchedules(pumpSettings.basalSchedules);

  const COLUMNS = [
    { key: 'start',
      label: 'Start time' },
    { key: 'rate',
      label: {
        main: 'Basal Rates',
        secondary: 'U/hr',
      },
      className: styles.basalScheduleHeader },
    { key: 'bgTarget',
      label: {
        main: 'Target BG',
        secondary: bgUnits,
      },
      className: styles.bolusSettingsHeader },
    { key: 'carbRatio',
      label: {
        main: 'Carb Ratio',
        secondary: 'g/U',
      },
      className: styles.bolusSettingsHeader },
    { key: 'insulinSensitivity',
      label: {
        main: 'Correction Factor',
        secondary: `${bgUnits}/U`,
      },
      className: styles.bolusSettingsHeader },
  ];

  const tables = _.map(schedules, (schedule) => (
    <div className="settings-table-container" key={schedule.name}>
      <CollapsibleContainer
        label={data.getScheduleLabel(schedule.name, pumpSettings.activeSchedule, deviceKey, true)}
        labelClass={styles.collapsibleLabel}
        opened={_.get(openedSections, schedule.name, printView)}
        toggleExpansion={_.partial(toggleProfileExpansion, schedule.name)}
        twoLineLabel={false}
      >
        <Table
          rows={data.processTimedSettings(pumpSettings, schedule, bgUnits)}
          columns={COLUMNS}
          tableStyle={styles.profileTable}
        />
      </CollapsibleContainer>
    </div>
  ));
  return (
    <div>
      <Header
        deviceDisplayName="Tandem"
        deviceMeta={data.getDeviceMeta(pumpSettings, timePrefs)}
        printView={printView}
      />
      <div>
        <span className={styles.title}>Profile Settings</span>
        {tables}
      </div>
    </div>
  );
};

Tandem.propTypes = {
  bgUnits: PropTypes.oneOf([MMOLL_UNITS, MGDL_UNITS]).isRequired,
  deviceKey: PropTypes.oneOf(['tandem']).isRequired,
  openedSections: PropTypes.object.isRequired,
  pumpSettings: React.PropTypes.shape({
    activeSchedule: React.PropTypes.string.isRequired,
    units: React.PropTypes.object.isRequired,
    deviceId: React.PropTypes.string.isRequired,
    basalSchedules: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        value: React.PropTypes.arrayOf(
          React.PropTypes.shape({
            start: React.PropTypes.number.isRequired,
            rate: React.PropTypes.number.isRequired,
          }),
        ),
      }).isRequired,
    ).isRequired,
    bgTargets: React.PropTypes.objectOf(
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          start: React.PropTypes.number.isRequired,
          target: React.PropTypes.number.isRequired,
        })
      ).isRequired,
    ).isRequired,
    carbRatios: React.PropTypes.objectOf(
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          start: React.PropTypes.number.isRequired,
          amount: React.PropTypes.number.isRequired,
        })
      ).isRequired,
    ).isRequired,
    insulinSensitivities: React.PropTypes.objectOf(
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          start: React.PropTypes.number.isRequired,
          amount: React.PropTypes.number.isRequired,
        })
      ).isRequired,
    ).isRequired,
  }).isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: React.PropTypes.bool.isRequired,
    timezoneName: React.PropTypes.oneOfType([React.PropTypes.string, null]),
  }).isRequired,
  toggleProfileExpansion: PropTypes.func.isRequired,
  printView: React.PropTypes.bool.isRequired,
};

Tandem.defaultProps = {
  deviceDisplayName: 'Tandem',
  deviceKey: 'tandem',
  printView: false,
};

export default Tandem;
