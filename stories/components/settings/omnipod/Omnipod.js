import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Omnipod from '../../../../src/components/settings/omnipod/Omnipod';
const flatRateSettings = require('../../../../data/pumpSettings/omnipod/flatrate.json');
const multiRateSettings = require('../../../../data/pumpSettings/omnipod/multirate.json');
const mmolL = 'mmol/L';

storiesOf('Omnipod', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <Omnipod pumpSettings={flatRateSettings} bgUnits={mmolL} />
  ))
  .add('multi rate', () => (
    // eslint-disable-next-line global-require
    <Omnipod pumpSettings={multiRateSettings} bgUnits={mmolL} />
  ));
