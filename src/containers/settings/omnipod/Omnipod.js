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

import styles from './Omnipod.css';

const Omnipod = (props) => {
  const { bgUnits, pumpSettings } = props;

  const renderBasalsData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'rate', label: 'Value (U/hr)', className: '' },
    ];
    const schedules = common.getScheduleNames(pumpSettings.basalSchedules);

    const tables = schedules.map((schedule) => {
      const title = {
        label: pumpSettings.basalSchedules[schedule].name,
        className: styles.basalSchedulesHeader,
      };

      return (
        <div>
          <CollapsibleContainer
            styledLabel={title}
            openByDefault={
              pumpSettings.basalSchedules[schedule].name === pumpSettings.activeSchedule
            }
          >
            <Table
              rows={
                dataProcessing.processBasalRateData(pumpSettings.basalSchedules[schedule])
              }
              columns={columns}
            />
          </CollapsibleContainer>
        </div>
      );
    });
    return (<div>{tables}</div>);
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
      <div>
        <Table
          title={title}
          rows={
            dataProcessing.processSensitivityData(
              pumpSettings.insulinSensitivity,
              bgUnits,
            )
          }
          columns={columns}
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
      <div>
        <Table
          title={title}
          rows={
            dataProcessing.processCarbRatioData(
              pumpSettings.carbRatio,
            )
          }
          columns={columns}
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
      <div>
        <Table
          title={title}
          rows={
            dataProcessing.processBgTargetData(
              pumpSettings.bgTarget,
              bgUnits,
              { columnTwo: 'target', columnThree: 'high' },
            )
          }
          columns={columns}
        />
      </div>
    );
  };

  return (
    <div>
      <Header
        deviceType="Omnipod"
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

Omnipod.propTypes = {
  bgUnits: PropTypes.oneOf([common.MMOLL_UNITS, common.MGDL_UNITS]).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
Omnipod.defaultProps = {
  bgUnits: common.MGDL_UNITS,
};

export default Omnipod;
