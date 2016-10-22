import React from 'react';

import { storiesOf } from '@kadira/storybook';

import configureStore from 'redux-mock-store';

import { getSettingsComponent } from '../../../../src/utils/settings/factory';
const DeviceSettings = getSettingsComponent('carelink');
const flatRateSettings = require('../../../../data/pumpSettings/medtronic/flatrate.json');
const multiRateSettings = require('../../../../data/pumpSettings/medtronic/multirate.json');
const mmolL = 'mmol/L';
const timePrefs = { timezoneAware: false, timezoneName: null };

const mockStore = configureStore()();

storiesOf('Medtronic', module)
  .add('flat rate', () => (
    <DeviceSettings
      bgUnits={mmolL}
      pumpSettings={flatRateSettings}
      store={mockStore}
      timePrefs={timePrefs}
    />
  ))
  .add('multi rate', () => (
    <DeviceSettings
      bgUnits={mmolL}
      pumpSettings={multiRateSettings}
      store={mockStore}
      timePrefs={timePrefs}
    />
  ));
