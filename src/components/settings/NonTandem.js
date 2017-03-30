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
import ClipboardButton from 'react-clipboard.js';

import Header from './common/Header';
import Table from './common/Table';
import CollapsibleContainer from './common/CollapsibleContainer';

import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import * as nonTandemData from '../../utils/settings/nonTandemData';
import { nonTandemText } from '../../utils/settings/textData';

import { DISPLAY_VIEW, PRINT_VIEW } from './constants';
import styles from './NonTandem.css';

const NonTandem = (props) => {
  const {
    bgUnits,
    deviceKey,
    openedSections,
    pumpSettings,
    timePrefs,
    toggleBasalScheduleExpansion,
    view,
  } = props;

  let lookupKey = deviceKey;

  if (deviceKey === 'carelink') {
    lookupKey = 'medtronic';
  }

  function buildTable(rows, columns, title, tableStyle) {
    return (
      <Table
        title={title}
        rows={rows}
        columns={columns}
        tableStyle={tableStyle}
      />
    );
  }

  function renderBreathingSpace() {
    if (view === PRINT_VIEW) {
      return (
        <div className={styles.printNotes}>
          <hr />
          <hr />
        </div>
      );
    }
    return null;
  }

  function openSection(sectionName) {
    if (view === PRINT_VIEW) {
      return true;
    }
    return _.get(openedSections, sectionName, false);
  }

  function renderBasalsData() {
    return _.map(nonTandemData.basalSchedules(pumpSettings), (schedule) => {
      const basal = nonTandemData.basal(schedule, pumpSettings, deviceKey);
      const toggleFn = _.partial(toggleBasalScheduleExpansion, basal.scheduleName);

      let labelClass = styles.singleLineBasalScheduleHeader;
      if (basal.activeAtUpload) {
        labelClass = styles.twoLineBasalScheduleHeader;
      }

      return (
        <div className={styles.categoryContainer} key={schedule}>
          <CollapsibleContainer
            label={basal.title}
            labelClass={labelClass}
            opened={openSection(basal.scheduleName)}
            toggleExpansion={toggleFn}
            twoLineLabel
          >
            {buildTable(
              basal.rows,
              basal.columns,
              {},
              styles.basalTable,
            )}
          </CollapsibleContainer>
          {renderBreathingSpace()}
        </div>
      );
    });
  }

  function renderSensitivityData() {
    const sensitivity = nonTandemData.sensitivity(pumpSettings, lookupKey, bgUnits);
    const title = {
      label: {
        main: sensitivity.title,
        secondary: `${bgUnits}/U`,
      },
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.categoryContainer}>
        {buildTable(
          sensitivity.rows,
          sensitivity.columns,
          title,
          styles.settingsTable,
        )}
        {renderBreathingSpace()}
      </div>
    );
  }

  function renderRatioData() {
    const ratio = nonTandemData.ratio(pumpSettings, lookupKey);
    const title = {
      label: {
        main: ratio.title,
        secondary: 'g/U',
      },
      className: styles.bolusSettingsHeader,
    };

    return (
      <div className={styles.categoryContainer}>
        {buildTable(
          ratio.rows,
          ratio.columns,
          title,
          styles.settingsTable,
        )}
        {renderBreathingSpace()}
      </div>
    );
  }

  function renderTargetData() {
    const target = nonTandemData.target(pumpSettings, lookupKey);
    const title = {
      label: {
        main: target.title,
        secondary: bgUnits,
      },
      className: styles.bolusSettingsHeader,
    };

    return (
      <div className={styles.categoryContainer}>
        {buildTable(
          target.rows,
          target.columns,
          title,
          styles.settingsTable,
        )}
        {renderBreathingSpace()}
      </div>
    );
  }

  return (
    <div>
      <ClipboardButton
        className={styles.copyButton}
        button-title="For email or notes"
        data-clipboard-target="#copySettingsText"
      >
        <p>Copy as text</p>
      </ClipboardButton>
      <Header
        deviceDisplayName={nonTandemData.deviceName(lookupKey)}
        deviceMeta={nonTandemData.deviceMeta(pumpSettings, timePrefs)}
        printView={view === PRINT_VIEW}
      />
      {renderBreathingSpace()}
      <div className={styles.settingsContainer}>
        <div>
          <div className={styles.basalSettingsContainer}>
            <div className={styles.categoryTitle}>Basal Rates</div>
            {renderBasalsData()}
          </div>
        </div>
        <div className={styles.bolusSettingsContainer}>
          <div className={styles.categoryTitle}>{nonTandemData.bolusTitle(lookupKey)}</div>
          {renderSensitivityData()}
          {renderTargetData()}
          {renderRatioData()}
        </div>
      </div>
      <pre className={styles.copyText} id="copySettingsText">
        {nonTandemText(pumpSettings, lookupKey, bgUnits)}
      </pre>
    </div>
  );
};

NonTandem.propTypes = {
  bgUnits: PropTypes.oneOf([MMOLL_UNITS, MGDL_UNITS]).isRequired,
  deviceKey: PropTypes.oneOf(['animas', 'carelink', 'insulet', 'medtronic']).isRequired,
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
  view: PropTypes.oneOf([DISPLAY_VIEW, PRINT_VIEW]).isRequired,
};

export default NonTandem;
