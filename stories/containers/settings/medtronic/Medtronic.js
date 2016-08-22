import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Medtronic from '../../../../src/containers/settings/medtronic/Medtronic';
const flatRateSettings = require('../../../../data/pumpSettings/medtronic/flatrate.json');
const multiRateSettings = require('../../../../data/pumpSettings/medtronic/multirate.json');
const mmolL = 'mmol/L';

storiesOf('Medtronic', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <Medtronic pumpSettings={flatRateSettings} bgUnits={mmolL} />
  ))
  .add('multi rate', () => (
    // eslint-disable-next-line global-require
    <Medtronic pumpSettings={multiRateSettings} bgUnits={mmolL} />
  ));
