import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Medtronic from '../../../../src/containers/settings/medtronic/Medtronic';

import CollapsibleContainer from '../../../../src/containers/common/CollapsibleContainer';

const medtronicFlatRateSettings = require('../../../../data/pumpSettings/medtronic/flatrate.json');
const mmolL = 'mmol/L';

storiesOf('MedtronicSettings', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <div>
      <CollapsibleContainer keepContent={false} label="Section One" openByDefault >
        <Medtronic pumpSettings={medtronicFlatRateSettings} bgUnits={mmolL} />
      </CollapsibleContainer>
      <CollapsibleContainer keepContent={false} label="Section Two" >
        <Medtronic pumpSettings={medtronicFlatRateSettings} bgUnits={mmolL} />
      </CollapsibleContainer>
    </div>
  ));
