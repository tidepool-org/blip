import React, { PropTypes } from 'react';
import _ from 'lodash';

import Table from '../../../components/common/Table';
import * as format from '../../../utils/format';
import * as common from '../common';

import styles from './Medtronic.css';

const Medtronic = (props) => {
  const { bgUnits, pumpSettings } = props;

  const buildBasalRateTables = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'rate', label: 'Value (U/hr)', className: '' },
    ];
    const schedules = _.keysIn(pumpSettings.basalSchedules);

    const tables = schedules.map((schedule) => {
      const starts = pumpSettings.basalSchedules[schedule].map(s => s.start);
      const data = starts.map((startTime) => (
        { start: common.getTime(pumpSettings.basalSchedules[schedule], startTime),
          rate: common.getRate(pumpSettings.basalSchedules[schedule], startTime),
        }
      ));
      const title = { label: schedule, className: styles.basalSchedulesHeader };

      return (
        <div>
          <Table
            title={title}
            rows={data}
            columns={columns}
          />
        </div>
      );
    });
    return (<div>{tables}</div>);
  };

  const getSensitivityData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'amount', label: `Value (${bgUnits}/U)`, className: '' },
    ];
    const title = { label: 'Sensitivity (ISF, Correction)', className: styles.bolusSettingsHeader };
    const starts = pumpSettings.insulinSensitivity.map(s => s.start);
    const sensitivityData = pumpSettings.insulinSensitivity;
    const data = starts.map((startTime) => (
      { start: common.getTime(sensitivityData, startTime),
        amount: common.getBloodGlucoseValue(sensitivityData, 'amount', startTime, bgUnits),
      }
    ));

    return (
      <div>
        <Table
          title={title}
          rows={data}
          columns={columns}
        />
      </div>
    );
  };

  const getBgTargetData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'low', label: 'Low', className: '' },
      { key: 'high', label: 'High', className: '' },
    ];
    const title = { label: `BG Target (${bgUnits})`, className: styles.bolusSettingsHeader };
    const starts = pumpSettings.bgTarget.map(s => s.start);
    const data = starts.map((startTime) => (
      { start: common.getTime(pumpSettings.bgTarget, startTime),
        low: common.getBloodGlucoseValue(pumpSettings.bgTarget, 'low', startTime, bgUnits),
        high: common.getBloodGlucoseValue(pumpSettings.bgTarget, 'high', startTime, bgUnits),
      }
    ));

    return (
      <div>
        <Table
          title={title}
          rows={data}
          columns={columns}
        />
      </div>
    );
  };

  const getCarbRatioData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'amount', label: 'Value (g/U)', className: '' },
    ];
    const title = {
      label: 'Insulin to Carb Ratio (I:C)',
      className: styles.bolusSettingsHeader,
    };
    const starts = pumpSettings.carbRatio.map(s => s.start);
    const data = starts.map((startTime) => (
      { start: common.getTime(pumpSettings.carbRatio, startTime),
        amount: pumpSettings
          .carbRatio
          .filter(s => s.start === startTime)
          .map(s => s.amount) }
    ));

    return (
      <div>
        <Table
          title={title}
          rows={data}
          columns={columns}
        />
      </div>
    );
  };

  return (
    <div className={styles.settings}>
      {buildBasalRateTables()}
      {getSensitivityData()}
      {getBgTargetData()}
      {getCarbRatioData()}
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
