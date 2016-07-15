import React from 'react';

import { storiesOf } from '@kadira/storybook';

import TandemSettings from '../../src/views/settings/TandemSettings';

import Tandem from '../../src/views/settings/Tandem';
import Medtronic from '../../src/views/settings/Medtronic';

storiesOf('TandemSettings', module)
  .add('flat rate', () => (
    <TandemSettings pumpSettings={require('../../data/pumpSettings/tandem/flatrate.json')} />
  ))
  .add('table flat rate', () => (
    <Tandem pumpSettings={require('../../data/pumpSettings/tandem/flatrate.json')} bgUnits={'mmol/L'} />
  ))
  .add('table multi rate', () => (
    <Tandem pumpSettings={require('../../data/pumpSettings/tandem/multirate.json')} bgUnits={'mmol/L'} />
  ));

storiesOf('MedtronicSettings', module)
  .add('flat rate', () => (
    <Medtronic pumpSettings={require('../../data/pumpSettings/medtronic/flatrate.json')} bgUnits={'mmol/L'} />
  ));


