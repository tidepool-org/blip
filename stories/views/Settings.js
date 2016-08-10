import React from 'react';

import { storiesOf } from '@kadira/storybook';

import Tandem from '../../src/containers/settings/tandem/Tandem';
import Medtronic from '../../src/containers/settings/medtronic/Medtronic';


import CollapsibleContainer from '../../src/containers/common/CollapsibleContainer';

const tandemFlatRateSettings = require('../../data/pumpSettings/tandem/flatrate.json');
const medtronicFlatRateSettings = require('../../data/pumpSettings/medtronic/flatrate.json');
const mmolL = 'mmol/L';

storiesOf('TandemSettings', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={tandemFlatRateSettings} bgUnits={mmolL} />
  ))
  .add('multi rate', () => (
    // eslint-disable-next-line global-require
    <Tandem pumpSettings={tandemFlatRateSettings} bgUnits={mmolL} />
  ));

storiesOf('MedtronicSettings', module)
  .add('flat rate', () => (
    // eslint-disable-next-line global-require
    <div>
      <CollapsibleContainer keepContent={false} title="Section One" openByDefault={false} >
        <Medtronic pumpSettings={medtronicFlatRateSettings} bgUnits={mmolL} />
      </CollapsibleContainer>
      <CollapsibleContainer keepContent={false} title="Section Two" >
        <Medtronic pumpSettings={medtronicFlatRateSettings} bgUnits={mmolL} />
      </CollapsibleContainer>
    </div>
  ));

storiesOf('CollapsibleContainer', module)
  .add('standard', () => (
    // eslint-disable-next-line global-require
    <CollapsibleContainer keepContent={false} />
  ));
