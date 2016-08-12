import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Tandem from '../../../../src/containers/settings/tandem/Tandem';
const tandemFlatRateSettings = require('../../../../data/pumpSettings/tandem/flatrate.json');
const tandemMultiRateSettings = require('../../../../data/pumpSettings/tandem/multirate.json');
const mmolL = 'mmol/L';

storiesOf('TandemSettings', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={tandemFlatRateSettings} bgUnits={mmolL} />
  ))
  .add('multi rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={tandemMultiRateSettings} bgUnits={mmolL} />
  ));
