import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Medtronic from '../../../../src/containers/settings/medtronic/Medtronic';

const medtronicFlatRateSettings = require('../../../../data/pumpSettings/medtronic/flatrate.json');
const mmolL = 'mmol/L';

storiesOf('MedtronicSettings', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <div>
      <Medtronic pumpSettings={medtronicFlatRateSettings} bgUnits={mmolL} />
    </div>
  ));
