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
import textTable from 'text-table';
import i18next from 'i18next';

const t = i18next.t.bind(i18next);

/**
 *
 * @param {Array} parameters Diabeloop patient device parameters
 * @return {Map} parameters by level
 */
export function getParametersByLevel(parameters) {
  const mapParams = new Map();

  // eslint-disable-next-line lodash/prefer-lodash-method
  parameters.forEach((parameter) => {
    if (!mapParams.has(parameter.level)) {
      mapParams.set(parameter.level, []);
    }

    mapParams.get(parameter.level).push(parameter);
  });

  return mapParams;
}

/**
 *
 * @param {Object} device Device information
 * @return {Array} an array of arrays
 */
function getDeviceRows(device) {
  return [
    [t('Manufacturer'), device.manufacturer],
    [t('Identifier'), device.deviceId],
    [t('IMEI'), device.imei],
    [t('Software version'), device.swVersion],
  ];
}

/**
 * Diabeloop text for clipboard copy.
 * @param {Object} device Diabeloop device informations
 *  (deviceId, imei, name, manufacturer, swVersion)
 * @param {Map} parametersByLevel Diabeloop patient parameters sorted by level.
 */
export function diabeloopText(device, parametersByLevel, displayDeviceDate) {
  let deviceText = `-= ${t('Device')} =-\n`;

  deviceText += textTable(getDeviceRows(device));

  let parametersText = '';
  // eslint-disable-next-line lodash/prefer-lodash-method
  parametersByLevel.forEach((parameters, level) => {
    let pLevelText = `-= ${t('Parameters level')} ${level} =-\n`;

    const tableRows = [[t('Name'), t('Value'), t('Unit')]];

    // eslint-disable-next-line lodash/prefer-lodash-method
    parameters.forEach((parameter) => {
      tableRows.push([parameter.name, parameter.value, parameter.unit]);
    });

    pLevelText += textTable(tableRows, { align: ['l', 'r', 'l'] });

    parametersText = `${parametersText}\n${pLevelText}\n`;
  });

  return `${displayDeviceDate}\n\n${deviceText}\n${parametersText}`;
}

/**
 * Returns the data for the table of device informations.
 * @param {Object} device Diabeloop device informations
 *  (deviceId, imei, name, manufacturer, swVersion)
 * @returns {Object} An object: title,secondary, columns, rows
 */
export function diabeloopDevicesDataTable(device) {
  return {
    title: t('Device'),
    secondary: device.name,
    columns: ['', ''],
    rows: getDeviceRows(device),
  };
}

/**
 * diabeloopSettings
 *
 * Returns the data for the table of custom diabeloop data.
 *
 * @param {Object} settings object with pump settings data
 */
export function diabeloopSettings(settings) {
  const params = _.get(settings, 'payload.parameters');
  const device = _.get(settings, 'payload.device');

  if (!params || !device) {
    return null;
  }

  const columns = [
    {
      key: 'name',
      label: t('Parameter'),
    },
    {
      key: 'value',
      label: t('Value'),
    },
    {
      key: 'unit',
      label: t('Unit'),
    },
  ];
  const rows = params;

  return {
    title: t('Diabeloop'),
    secondary: device.swVersion,
    columns,
    rows,
  };
}
