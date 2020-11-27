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
import i18next from 'i18next';

import * as tandemData from './tandemData';
import * as nonTandemData from './nonTandemData';

import { formatBirthdate, formatCurrentDate, formatDiagnosisDate } from '../datetime';
import { getPatientFullName } from '../misc';

const t = i18next.t.bind(i18next);

/**
 * getItemField
 * @private
 */
function getItemField(item, field) {
  return item[field];
}

/**
 * normalizeColumns
 * @private
 */
function normalizeColumns(columns) {
  return _.map(columns, (column) => ({
    cell: getItemField,
    key: column.key,
    label: column.label,
  }));
}

/**
 * getRow
 * @private
 */
function getRow(normalizedColumns, rowKey, rowData) {
  return _.map(normalizedColumns,
    (column) => column.cell(rowData, column.key)
  );
}

/**
 * getHeader
 * @private
 */
function getHeader(normalizedColumns) {
  return _.map(normalizedColumns, (column) => {
    if (typeof column.label === 'object') {
      return `${column.label.main} ${column.label.secondary}`;
    }
    return column.label;
  });
}

/**
 * getRows
 * @private
 */
function getRows(rows, columns) {
  return _.map(rows, (row, key) => (
    getRow(normalizeColumns(columns), key, row)
  ));
}

/**
 * toTextTable
 * @private
 */
function toTextTable(rows, columns) {
  const header = [getHeader(normalizeColumns(columns))];
  const content = getRows(rows, columns);
  return table(header.concat(content));
}

/**
 * buildTextTable
 * @private
 */
function buildTextTable(name, rows, columns) {
  return `\n${name}\n${toTextTable(rows, columns)}\n`;
}

/**
 * formatTitle
 * @private
 */
function formatTitle(patient) {
  const exported = t('Exported from Tidepool: {{date}}', { date: formatCurrentDate() });
  const bday = t('Date of birth: {{date}}', { date: formatBirthdate(patient) });
  const diagnosis = t('Date of diagnosis: {{date}}', { date: formatDiagnosisDate(patient) });
  const fullname = getPatientFullName(patient);
  return `${fullname}\n${bday}\n${diagnosis}\n${exported}\n`;
}

/**
 * nonTandemText
 * @param  {Object} patient     the patient object that contains the profile
 * @param  {String} units         MGDL_UNITS or MMOLL_UNITS
 * @param  {String} manufacturer  one of: animas, carelink, insulet, medtronic
 *
 * @return {String}               non tandem settings as a string table
 */
export function nonTandemText(patient, settings, units, manufacturer) {
  let tablesString = formatTitle(patient);
  _.map(nonTandemData.basalSchedules(settings), (schedule) => {
    const basal = nonTandemData.basal(schedule, settings, manufacturer);
    tablesString += buildTextTable(
      basal.scheduleName,
      basal.rows,
      basal.columns,
    );
  });

  const sensitivity = nonTandemData.sensitivity(settings, manufacturer, units);
  tablesString += buildTextTable(
    `${sensitivity.title} ${units}/U`,
    sensitivity.rows,
    sensitivity.columns,
  );

  const target = nonTandemData.target(settings, manufacturer, units);
  tablesString += buildTextTable(
    `${target.title} ${units}`,
    target.rows,
    target.columns,
  );

  const ratio = nonTandemData.ratio(settings, manufacturer);
  tablesString += buildTextTable(
    `${ratio.title} g/U`,
    ratio.rows,
    ratio.columns,
  );

  return tablesString;
}

/**
 * tandemText
 * @param  {Object} patient     the patient object that contains the profile
 * @param  {Object} settings    all settings data
 * @param  {String} units       MGDL_UNITS or MMOLL_UNITS
 *
 * @return {String}             tandem settings as a string table
 */
export function tandemText(patient, settings, units) {
  const styles = {
    bolusSettingsHeader: '',
    basalScheduleHeader: '',
  };

  let tablesString = formatTitle(patient);
  _.map(tandemData.basalSchedules(settings), (schedule) => {
    const basal = tandemData.basal(schedule, settings, units, styles);
    tablesString += buildTextTable(
      basal.scheduleName,
      basal.rows,
      basal.columns,
    );
  });
  return tablesString;
}
