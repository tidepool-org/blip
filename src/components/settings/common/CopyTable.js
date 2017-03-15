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

import styles from './CopyTable.css';

class CopyTable extends PureComponent {

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
        return (
          <div key={key} className={styles.cell}>
            {label}
          </div>
        );
      }
    );
    return (<div className={styles.row}>{cells}</div>);
  }

  renderRow(normalizedColumns, rowKey, rowData) {
    const cells = _.map(normalizedColumns,
      (column) => <div className={styles.cell}>{column.cell(rowData, column.key)}</div>
    );
    return (<div className={styles.row} key={rowKey}>{cells}</div>);
  }

  renderRows(normalizedColumns) {
    return _.map(this.props.rows, (row, key) => (
      this.renderRow(normalizedColumns, key, row)
    ));
  }

  render() {
    const normalizedColumns = this.normalizeColumns();

    let tableContents = [];

    if (!_.isEmpty(this.props.title)) {
      const { label: { main, secondary } } = this.props.title;
      const title = (
        <div className={styles.title}>
          {`${main} ${secondary}`}
        </div>
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
      <div className={styles.table}>
        {tableContents}
      </div>
    );
  }
}

CopyTable.propTypes = {
  title: React.PropTypes.shape({
    className: React.PropTypes.string.isRequired,
    label: React.PropTypes.object.isRequired,
  }),
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};

export default CopyTable;
