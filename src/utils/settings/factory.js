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

import React from 'react';

import NonTandem from '../../components/settings/nontandem/NonTandem';
import Tandem from '../../components/settings/tandem/Tandem';

/**
 * injectBolusSettingsColumns
 * @param {String} manufacturer - non-Tandem insulin pump manufacturer
 *
 * @return {Component} NonTandem React component with bolusSettingsColumns injected
 */
export function injectManufacturerSpecificInfo(manufacturer, Component) {
  const bgTargetsByManufacturer = {
    animas: [
      { key: 'start', label: 'Start time' },
      { key: 'columnTwo', label: 'Target' },
      { key: 'columnThree', label: 'Range' },
    ],
    carelink: [
      { key: 'start', label: 'Start time' },
      { key: 'columnTwo', label: 'Low' },
      { key: 'columnThree', label: 'High' },
    ],
    insulet: [
      { key: 'start', label: 'Start time' },
      { key: 'columnTwo', label: 'Target' },
      { key: 'columnThree', label: 'Correct Above' },
    ],
  };
  const bgTargetByManufacturer = {
    animas: 'BG Target',
    carelink: 'BG Target',
    insulet: 'Target BG',
  };
  const insulinSensitivityByManufacturer = {
    animas: 'ISF',
    carelink: 'Sensitivity',
    insulet: 'Correction factor',
  };
  const carbRatioByManufacturer = {
    animas: 'I:C Ratio',
    carelink: 'Carb Ratios',
    insulet: 'IC ratio',
  };
  const bolusSettingsLabelsByManufacturer = {
    animas: 'ezCarb ezBG',
    carelink: 'Bolus Wizard',
    insulet: 'Bolus Calculator',
  };
  const deviceTypesByManufacturer = {
    animas: 'Animas',
    carelink: 'Medtronic',
    insulet: 'OmniPod',
  };
  return (props) => (
    <Component
      bgTargetColumns={bgTargetsByManufacturer[manufacturer]}
      bgTargetLabel={bgTargetByManufacturer[manufacturer]}
      bolusSettingsLabel={bolusSettingsLabelsByManufacturer[manufacturer]}
      carbRatioLabel={carbRatioByManufacturer[manufacturer]}
      deviceType={deviceTypesByManufacturer[manufacturer]}
      insulinSensitivityLabel={insulinSensitivityByManufacturer[manufacturer]}
      manufacturerKey={manufacturer}
      {...props}
    />
  );
}

/**
 * getSettingsComponent
 * @param  {String} deviceType - desired chart device name.
 *                               Either `carelink`, `tandem`, `insulet` or `animas`.
 *
 * @return {Component} - React component for given device type or an error if an unsupported type
 */
export function getSettingsComponent(deviceType) {
  let deviceKey = deviceType.toLowerCase();
  deviceKey = (deviceKey === 'medtronic') ? 'carelink' : deviceKey;
  if (deviceKey === 'carelink') {
    return injectManufacturerSpecificInfo(deviceKey, NonTandem);
  } else if (deviceKey === 'tandem') {
    return Tandem;
  } else if (deviceKey === 'insulet') {
    return injectManufacturerSpecificInfo(deviceKey, NonTandem);
  } else if (deviceKey === 'animas') {
    return injectManufacturerSpecificInfo(deviceKey, NonTandem);
  }
  const types = ['animas', 'carelink', 'insulet', 'medtronic', 'tandem'];
  throw new Error(`\`deviceType\` must one of ${types.join(', ')}.`);
}
