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

import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';

import styles from './Table.css';

class Table extends PureComponent {
  getItemField(item, field) {
    return item[field];
  }

  normalizeColumns() {
    const getItemField = this.getItemField;
    const { columns } = this.props;

    return _.map(columns, (column) => ({
      cell: getItemField,
      className: column.className,
      key: column.key,
      label: column.label,
    }));
  }

  renderHeader(normalizedColumns) {
    const cells = _.map(normalizedColumns,
      (column, key) => {
        const { label } = column;
        if (typeof label === 'object' && _.isEqual(_.keys(label), ['main', 'secondary'])) {
          return (
            <th key={key} className={column.className}>
              {label.main}<span className={styles.secondaryLabelWithMain}>{label.secondary}</span>
            </th>
          );
        }
        return (
          <th key={key} className={styles.secondaryLabelAlone}>
            {label}
          </th>
        );
      }
    );
    return (<thead key={`thead_${cells.length}`}><tr>{cells}</tr></thead>);
  }

  renderRow(normalizedColumns, rowKey, rowData) {
    const cells = _.map(normalizedColumns,
      (column) => <td key={column.key}>{column.cell(rowData, column.key)}</td>
    );
    return (<tr key={rowKey}>{cells}</tr>);
  }

  renderRows(normalizedColumns) {
    const rowData = _.map(this.props.rows, (row, key) => (
      this.renderRow(normalizedColumns, key, row)
    ));
    return (<tbody key={`tbody_${rowData.length}`}>{rowData}</tbody>);
  }

  render() {
    const normalizedColumns = this.normalizeColumns();

    let tableContents = [];

    if (!_.isEmpty(this.props.title)) {
      const { className, label: { main, secondary } } = this.props.title;
      const title = (
        <caption
          key={main}
          className={className}
        >
          {main}<span className={styles.secondaryLabelWithMain}>{secondary}</span>
        </caption>
      );
      tableContents = [
        title,
        this.renderHeader(normalizedColumns),
        this.renderRows(normalizedColumns),
      ];
    } else {
      tableContents = [
        this.renderHeader(normalizedColumns),
        this.renderRows(normalizedColumns),
      ];
    }

    return (
      <table className={this.props.tableStyle}>
        {tableContents}
      </table>
    );
  }
}

Table.propTypes = {
  title: React.PropTypes.shape({
    className: React.PropTypes.string.isRequired,
    label: React.PropTypes.object.isRequired,
  }),
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  tableStyle: PropTypes.string.isRequired,
};

export default Table;
