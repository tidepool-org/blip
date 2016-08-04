import React from 'react';

import { storiesOf } from '@kadira/storybook';

import TandemSettings from '../../src/views/settings/TandemSettings';

import Tandem from '../../src/views/settings/Tandem';
import Medtronic from '../../src/views/settings/Medtronic';

const tandemFlatRateSettings = require('../../data/pumpSettings/tandem/flatrate.json');
const medtronicFlatRateSettings = require('../../data/pumpSettings/medtronic/flatrate.json');
const mmolL = 'mmol/L'

storiesOf('TandemSettings', module)
  .add('flat rate', () => (
    <TandemSettings pumpSettings={tandemFlatRateSettings} />
  ))
  .add('table flat rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={tandemFlatRateSettings} bgUnits={mmolL} />
  ))
  .add('table multi rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={tandemFlatRateSettings} bgUnits={mmolL} />
  ));

storiesOf('MedtronicSettings', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <Medtronic pumpSettings={medtronicFlatRateSettings} bgUnits={mmolL} />
  ));
