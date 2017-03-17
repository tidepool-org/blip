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

import _ from 'lodash';
import table from 'text-table';
import * as data from '../../../utils/settings/data';

function getItemField(item, field) {
  return item[field];
}

function normalizeColumns(columns) {
  const getItemField = this.getItemField;
  return _.map(columns, (column) => ({
    cell: getItemField,
    key: column.key,
    label: column.label,
  }));
}

function getRow(normalizedColumns, rowKey, rowData) {
  return  _.map(normalizedColumns,
    (column) => column.cell(rowData, column.key)
  );
}

function getRows(rows, columns) {
  const normalizedColumns = normalizeColumns(columns)
  return _.map(rows, (row, key) => (
    this.getRow(normalizedColumns, key, row)
  ));
}

export function toTextTable(rows, columns) {
  return table(this.getRows(rows, columns));
}
