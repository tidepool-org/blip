import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Tandem from '../../../../src/components/settings/tandem/Tandem';
const flatRateSettings = require('../../../../data/pumpSettings/tandem/flatrate.json');
const multiRateSettings = require('../../../../data/pumpSettings/tandem/multirate.json');
const mmolL = 'mmol/L';
const timePrefs = { timezoneAware: false, timezoneName: null };

storiesOf('Tandem', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={flatRateSettings} bgUnits={mmolL} timePrefs={timePrefs} />
  ))
  .add('multi rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={multiRateSettings} bgUnits={mmolL} timePrefs={timePrefs} />
  ));
