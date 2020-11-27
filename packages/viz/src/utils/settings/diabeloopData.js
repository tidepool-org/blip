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
import textTable from 'text-table';
import i18next from 'i18next';

import { formatParameterValue } from '../format';

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

    const value = formatParameterValue(parameter.value, parameter.unit);
    const param = {
      name: t(`params:::${parameter.name}`),
      value,
      unit: parameter.unit,
      level: parameter.level,
    };
    mapParams.get(parameter.level).push(param);
  });

  return mapParams;
}

/**
 * Diabeloop text for clipboard copy.
 * @param {Object} device Diabeloop device informations
 *  (deviceId, imei, name, manufacturer, swVersion)
 * @param {Map} parametersByLevel Diabeloop patient parameters sorted by level.
 */
export function diabeloopText(device, parametersByLevel, displayDeviceDate) {
  const deviceRows = [
    [t('Manufacturer'), device.manufacturer],
    [t('Identifier'), device.deviceId],
    [t('IMEI'), device.imei],
    [t('Software version'), device.swVersion],
  ];

  let deviceText = `-= ${t('Device')} =-\n`;

  deviceText += textTable(deviceRows);

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
 * Datas for PDF
 * @param {Object} device Diabeloop device infos
 */
export function getDeviceInfosData(device) {
  const heading = {
    text: t('Device'),
    subText: device.name,
  };

  const columns = [{
    id: 'label',
    headerFill: false,
    cache: false,
    align: 'left',
    width: 150,
  }, {
    id: 'value',
    headerFill: false,
    cache: false,
    align: 'right',
    width: 150,
  }];

  const rows = [{
    label: t('Manufacturer'),
    value: device.manufacturer,
  }, {
    label: t('Identifier'),
    value: device.deviceId,
  }, {
    label: t('IMEI'),
    value: device.imei,
  }, {
    label: t('Software version'),
    value: device.swVersion,
  }];

  return {
    heading,
    columns,
    rows,
  };
}

/**
 * Return the information to make the PDF table for a level of parameters
 * @param {Array} parameters Array of parameters (object: name, value, unit, level)
 * @param {number} level Level of the parameter
 * @param {number} width Width of the table
 */
export function getDeviceParametersData(parameters, opts) {
  const {
    level,
    width,
  } = opts;

  const heading = {
    text: t('Parameters'),
    subText: t('level {{level}}', { level }),
  };

  const columns = [{
    id: 'name',
    header: t('Name'),
    cache: false,
    align: 'left',
    width: (width * 0.7),
  }, {
    id: 'value',
    header: t('Value'),
    cache: false,
    align: 'right',
    width: (width * 0.2),
  }, {
    id: 'unit',
    header: t('Unit'),
    cache: false,
    align: 'left',
    width: (width * 0.1),
  }];

  return {
    heading,
    columns,
    rows: parameters,
  };
}
