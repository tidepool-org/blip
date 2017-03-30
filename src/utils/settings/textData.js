/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import * as tandemData from './tandemData';
import * as nonTandemData from './nonTandemData';

function getItemField(item, field) {
  return item[field];
}

function normalizeColumns(columns) {
  return _.map(columns, (column) => ({
    cell: getItemField,
    key: column.key,
    label: column.label,
  }));
}

function getRow(normalizedColumns, rowKey, rowData) {
  return _.map(normalizedColumns,
    (column) => column.cell(rowData, column.key)
  );
}

function getRows(rows, columns) {
  const normalizedColumns = normalizeColumns(columns);
  return _.map(rows, (row, key) => (
    getRow(normalizedColumns, key, row)
  ));
}

function toTextTable(rows, columns) {
  return table(getRows(rows, columns));
}

function buildTextTable(name, rows, columns) {
  return `\n${name}\n${toTextTable(rows, columns)}\n`;
}

export function nonTandemText(settings, manufacturer, units) {
  let tablesString = '';
  _.map(nonTandemData.basalSchedules(settings), (schedule) => {
    const basal = nonTandemData.basal(schedule, settings, manufacturer);
    tablesString += buildTextTable(
      basal.title,
      basal.rows,
      basal.columns,
    );
  });

  const sensitivity = nonTandemData.sensitivity(settings, manufacturer ,units);
  tablesString += buildTextTable(
    sensitivity.title,
    sensitivity.rows,
    sensitivity.columns,
  );

  const target = nonTandemData.target(settings, manufacturer);
  tablesString += buildTextTable(
    target.title,
    target.rows,
    target.columns,
  );

  const ratio = nonTandemData.ratio(settings, manufacturer);
  tablesString += buildTextTable(
    ratio.title,
    ratio.rows,
    ratio.columns,
  );

  return tablesString;
}

export function tandemText(settings, units, styles) {
  let tablesString = '';
  _.map(tandemData.basalSchedules(settings), (schedule) => {
    const basal = tandemData.basal(schedule, settings, units, styles);
    tablesString += buildTextTable(
      basal.title,
      basal.rows,
      basal.columns,
    );
  });
  return tablesString;
}
