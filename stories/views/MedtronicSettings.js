import React from 'react';

import { storiesOf } from '@kadira/storybook';

import MedtronicSettings from '../../src/views/settings/MedtronicSettings';

storiesOf('MedtronicSettings', module)
  .add('flat rate', () => (
    <MedtronicSettings pumpSettings={require('../../data/pumpSettings/medtronic/flatrate.json')} bgUnits={'mmol/L'} />
  ));


