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

import styles from './Animas.css';

const Animas = (props) => {
  const { bgUnits, pumpSettings, timePrefs } = props;

  const renderBasalsData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'rate', label: 'Value', className: '' },
    ];
    const schedules = data.getScheduleNames(pumpSettings.basalSchedules);

    const tables = _.map(schedules, (schedule) => {
      const title = {
        label: data.getScheduleLabel(
          pumpSettings.basalSchedules[schedule].name,
          pumpSettings.activeSchedule,
          styles.lightText,
          'U/hr',
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
                data.processBasalRateData(pumpSettings.basalSchedules[schedule])
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
      { key: 'amount', label: 'Value', className: '' },
    ];
    const title = {
      label: <div>ISF <span className={styles.lightText}>{bgUnits}/U</span></div>,
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            data.processSensitivityData(
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
      { key: 'amount', label: 'Value', className: '' },
    ];
    const title = {
      label: <div>I:C Ratio <span className={styles.lightText}>g/U</span></div>,
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            data.processCarbRatioData(
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
      { key: 'columnThree', label: 'Range +/-', className: '' },
    ];
    const title = {
      label: <div>BG Target <span className={styles.lightText}>{bgUnits}</span></div>,
      className: styles.bolusSettingsHeader,
    };
    return (
      <div className={styles.block}>
        <Table
          title={title}
          rows={
            data.processBgTargetData(
              pumpSettings.bgTarget,
              bgUnits,
              { columnTwo: 'target', columnThree: 'range' },
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
        deviceType="Animas"
        deviceMeta={data.getDeviceMeta(pumpSettings, timePrefs)}
      />
      <div className={styles.settings}>
        <div>
          <span className={styles.categoryTitle}>Basal Rates</span>
          {renderBasalsData()}
        </div>
        <div className={styles.nonBasalWrap}>
          <span className={styles.categoryTitle}>Bolus Calculator</span>
          {renderSensitivityData()}
          {renderTargetData()}
          {renderRatioData()}
        </div>
      </div>
    </div>
  );
};

Animas.propTypes = {
  bgUnits: PropTypes.oneOf([constants.MMOLL_UNITS, constants.MGDL_UNITS]).isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: React.PropTypes.bool.isRequired,
    timezoneName: React.PropTypes.oneOfType([React.PropTypes.string, null]),
  }).isRequired,
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
      }),
    ).isRequired,
    bgTarget: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        start: React.PropTypes.number.isRequired,
        target: React.PropTypes.number,
        range: React.PropTypes.number,
      })
    ).isRequired,
    carbRatio: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        start: React.PropTypes.number.isRequired,
        amount: React.PropTypes.number.isRequired,
      })
    ).isRequired,
    insulinSensitivity: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        start: React.PropTypes.number.isRequired,
        amount: React.PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Animas;
