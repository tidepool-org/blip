import React from 'react';
import i18next from 'i18next';
import _ from 'lodash';

import Table from './common/Table';

import styles from './Diabeloop.css';

const t = i18next.t.bind(i18next);

export default class HistoryTable extends Table {
  static get title() {
    return {
      label: {
        main: `${t('Parameters History')}`,
      },
      className: styles.bdlgSettingsHeader,
    };
  }

  static get columns() {
    return [
      {
        key: 'parameterChange',
        label: t('Parameter'),

      },
      {
        key: 'valueChange',
        label: t('Value'),

      },
      {
        key: 'level',
        label: t('Level'),
      }, {
        key: 'parameterDate',
        label: t('Date'),
      },
    ];
  }

  renderSpannedRow(normalizedColumns, rowKey, rowData) {
    const { switchToDailyIconClass, onSwitchToDaily } = this.props;
    let content = rowData.spannedContent;
    if (!content) {
      content = '&nbsp;';
    }
    return (
      <tr key={rowKey} className={styles.spannedRow}>
        <td colSpan={normalizedColumns.length}>
          {content}
          <i className={`${switchToDailyIconClass} ${styles.clickableIcon}`} onClick={onSwitchToDaily.bind(this, rowData.isoDate, 'Diabeloop parameters history')} />
        </td>
      </tr>);
  }

  renderRows(normalizedColumns) {
    const rows = this.getAllRows(this.props.rows);
    const rowData = _.map(rows, (row, key) => {
      if (row.isSpanned) {
        return this.renderSpannedRow(normalizedColumns, key, row);
      } else {
        return this.renderRow(normalizedColumns, key, row);
      }
    });
    return (<tbody key={`tbody_${rowData.length}`}>{rowData}</tbody>);
  }

  getParameterChange(parameter) {
    const { unknownParameterIcon, addedParameterIcon,
      deletedParameterIcon, updatedParameterIcon } = this.props;
    let icon = unknownParameterIcon;
    switch (parameter.changeType) {
      case 'added':
        icon = addedParameterIcon;
        break;
      case 'deleted':
        icon = deletedParameterIcon;
        break;
      case 'updated':
        icon = updatedParameterIcon;
        break;
      default:
        break;
    }
    return (
      <span>
        {icon}
        <span className={styles.parameterHistory}>{t(parameter.name)}</span>
      </span>
    );
  }

  getValueChange(parameter) {
    const { changeValueArrowIcon } = this.props;
    const value = <span>{`${parameter.value} ${parameter.unit}`}</span>;
    let previousValue;
    let spanClass = styles.historyValue;
    switch (parameter.changeType) {
      case 'added':
        spanClass = `${spanClass} ${styles.valueAdded}`;
        break;
      case 'deleted':
        spanClass = `${spanClass} ${styles.valueDeleted}`;
        break;
      case 'updated':
        spanClass = `${spanClass} ${styles.valueUpdated}`;
        previousValue = <span>{`${parameter.previousValue} ${parameter.previousUnit}`}</span>;
        break;
      default:
        break;
    }
    return (
      <span className={spanClass}>
        {parameter.changeType === 'updated' ? ([previousValue, changeValueArrowIcon, value]) : value}
      </span>
    );
  }

  formatData(data, params, ord) {
    const history = data.parameters;
    let currentParameters = params;
    let order = ord;
    const formattedData = _.map(history, (hist) => {
      const h = hist;
      switch (h.changeType) {
        case 'added':
          currentParameters.push(h);
          break;
        case 'deleted':
          currentParameters = _.filter(currentParameters, s => s.name !== h.name);
          break;
        case 'updated':
          currentParameters = _.map(currentParameters, current => {
            const param = current;
            if (param.name === h.name) {
              h.previousValue = param.value;
              h.previousUnit = param.unit;
              param.value = h.value;
              param.unit = h.unit;
            }
            return param;
          });
          break;
        default:
          break;
      }
      h.effectiveDate = new Date(h.effectiveDate);
      h.parameterDate = h.effectiveDate.toLocaleString();
      h.parameterChange = this.getParameterChange(h);
      h.valueChange = this.getValueChange(h);
      h.order = order;
      order++;
      return h;
    });
    // const maxDate = _.reduce(formattedData,
    //   (p1, p2) => ((p1.effectiveDate > p2.effectiveDate) ? p1.effectiveDate : p2.effectiveDate),
    //   new Date(0));
    const maxDate = new Date(data.changeDate);
    const rows = [
      {
        isSpanned: true,
        spannedContent: maxDate.toLocaleString(),
        isoDate: maxDate.toISOString(),
        order,
      },
    ];
    order++;

    return {
      rows: rows.concat(formattedData),
      currentParameters,
      order,
    };
  }

  getAllRows(history) {
    let rows = [];
    let order = 0;
    let currentParameters = [];
    _.forEach(_.sortBy(history, ['changeDate']), h => {
      const newRows = this.formatData(h, currentParameters, order);
      currentParameters = newRows.currentParameters;
      order = newRows.order;
      rows = rows.concat(newRows.rows);
    });
    return rows.sort((r1, r2) => (r1.order > r2.order ? -1 : 1));
  }
}
