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

class Table extends React.Component {

  getItemField(item, field) {
    return item[field];
  }

  normalizeColumns() {
    const getItemField = this.getItemField;
    const columns = this.props.columns;

    return columns.map((column) => ({
      key: column.key,
      label: column.label,
      className: column.className,
      cell: getItemField,
    })
    );
  }

  renderHeader(normalizedColumns) {
    const cells = normalizedColumns.map(
      (column, key) => <th key={key} className={column.className}>{column.label}</th>
    );
    return (<thead key={`thead_${cells.length}`}><tr>{cells}</tr></thead>);
  }

  renderRow(normalizedColumns, rowKey, rowData) {
    const cells = normalizedColumns.map(
      (column) => <td key={column.key}>{column.cell(rowData, column.key)}</td>
    );
    return (<tr key={rowKey}>{cells}</tr>);
  }

  renderRows(normalizedColumns) {
    const rowData = this.props.rows.map((row, key) => (
      this.renderRow(normalizedColumns, key, row)
    ));
    return (<tbody key={`tbody_${rowData.length}`}>{rowData}</tbody>);
  }

  render() {
    const normalizedColumns = this.normalizeColumns();

    let tableContents = [];

    if (this.props.title) {
      const title = (
        <caption
          key={this.props.title.label}
          className={this.props.title.className}
        >
          {this.props.title.label}
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
      <table className={`${this.props.tableStyle || ''}`}>
        {tableContents}
      </table>
    );
  }
}

Table.propTypes = {
  title: PropTypes.object,
  rows: PropTypes.array,
  columns: PropTypes.array,
  tableStyle: PropTypes.string,
};

export default Table;
