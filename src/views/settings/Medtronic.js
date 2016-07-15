import React, { PropTypes } from 'react';
import _ from 'lodash';
import Table from '../../components/settings/Table';

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
        { start: pumpSettings
            .basalSchedules[schedule]
            .filter(s => s.start === startTime)
            .map(s => s.start),
          rate: pumpSettings.
            basalSchedules[schedule]
            .filter(s => s.start === startTime)
            .map(s => s.rate) }
      ));
      const title = {label: schedule, className: styles.basalSchedulesHeader };

      return (
        <div>
          <Table
            title={title}
            rows={data}
            columns={columns}
          />
        </div>
      )
    });
    return (<div>{tables}</div>);
  };

  const getSensitivityData = () => {

    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'amount', label: `Value (${bgUnits}/U)`, className: '' },
    ];
    const title = {label: 'Sensitivity (ISF, Correction)', className: styles.bolusSettingsHeader };
    const starts = pumpSettings.insulinSensitivity.map(s => s.start);
    const data = starts.map((startTime) => (
      { start: pumpSettings
          .insulinSensitivity
          .filter(s => s.start === startTime)
          .map(s => s.start),
        amount: pumpSettings.
          insulinSensitivity
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

  const getBgTargetData = () => {
    const columns = [
      { key: 'start', label: 'Start time', className: '' },
      { key: 'low', label: `Low`, className: '' },
      { key: 'high', label: `High`, className: '' },
    ];
    const title = {label: `BG Target (${bgUnits})`, className: styles.bolusSettingsHeader };
    const starts = pumpSettings.bgTarget.map(s => s.start);
    const data = starts.map((startTime) => (
      { start: pumpSettings
          .bgTarget
          .filter(s => s.start === startTime)
          .map(s => s.start),
        low: pumpSettings.
          bgTarget
          .filter(s => s.start === startTime)
          .map(s => s.low),
        high: pumpSettings
          .bgTarget
          .filter(s => s.start === startTime)
          .map(s => s.high) }
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
    const title = {label: 'Insulin to Carb Ratio (I:C)', className: styles.bolusSettingsHeader };
    const starts = pumpSettings.carbRatio.map(s => s.start);
    const data = starts.map((startTime) => (
      { start: pumpSettings
          .carbRatio
          .filter(s => s.start === startTime)
          .map(s => s.start),
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
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  pumpSettings: PropTypes.object.isRequired,
};

// TODO: use webpack.DefinePlugin and only define defaultProps in DEV mode!
Medtronic.defaultProps = {
  bgUnits: 'mg/dL',
};

export default Medtronic;
