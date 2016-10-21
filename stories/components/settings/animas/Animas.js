import React from 'react';

import { storiesOf } from '@kadira/storybook';

import { getSettingsComponent } from '../../../../src/utils/settings/factory';
const DeviceSettings = getSettingsComponent('animas');
const flatRateSettings = require('../../../../data/pumpSettings/animas/flatrate.json');
const multiRateSettings = require('../../../../data/pumpSettings/animas/multirate.json');
const mmolL = 'mmol/L';
const timePrefs = { timezoneAware: false, timezoneName: null };

storiesOf('Animas', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <DeviceSettings pumpSettings={flatRateSettings} bgUnits={mmolL} timePrefs={timePrefs} />
  ))
  .add('multi rate', () => (
    // eslint-disable-next-line global-require
    <DeviceSettings pumpSettings={multiRateSettings} bgUnits={mmolL} timePrefs={timePrefs} />
  ));
