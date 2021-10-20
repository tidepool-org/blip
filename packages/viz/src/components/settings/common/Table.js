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

import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import styles from "./Table.css";

class Table extends React.Component {
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
        if (typeof label === "object" && _.isEqual(_.keys(label), ["main", "secondary"])) {
          return (
            <th key={key} className={column.className}>
              {label.main}<span className={styles.secondaryLabelWithMain}>{label.secondary}</span>
            </th>
          );
        }
        if (column.className) {
          return (
            <th key={key} className={column.className}>
              {label}
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

  renderRow(normalizedColumns, rowKey, rowData, /** @type {string} */ trClassName=null) {
    const cells = _.map(normalizedColumns,
      (column) => {
        const classname = (column.className) ? `${styles.secondaryLabelWithMain} ${column.className}` : styles.secondaryLabelWithMain;

        return <td key={column.key} className={classname}>{column.cell(rowData, column.key)}</td>;
      }
    );

    return (<tr key={rowKey} className={trClassName} data-raw={rowData.rawData}>{cells}</tr>);
  }

  renderRows(normalizedColumns) {
    const rowData = _.map(this.props.rows, (row, key) => (
      this.renderRow(normalizedColumns, key, row)
    ));
    return (<tbody key={`tbody_${rowData.length}`}>{rowData}</tbody>);
  }

  render() {
    const { id, title, tableStyle } = this.props;
    const normalizedColumns = this.normalizeColumns();

    let tableContents = [];

    if (!_.isEmpty(title)) {
      const { className, label: { main, secondary } } = title;
      const titleCaption = (
        <caption
          key={main}
          className={className}
        >
          {main}<span className={styles.secondaryLabelWithMain}>{secondary}</span>
        </caption>
      );
      tableContents = [
        titleCaption,
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
      <table id={id} className={tableStyle}>
        {tableContents}
      </table>
    );
  }
}

Table.propTypes = {
  title: PropTypes.shape({
    className: PropTypes.string.isRequired,
    label: PropTypes.object.isRequired,
  }),
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  tableStyle: PropTypes.string.isRequired,
  id: PropTypes.string,
};

Table.defaultProps = {
  id: "table",
};

export default Table;
