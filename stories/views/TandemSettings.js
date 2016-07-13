import React from 'react';

import { storiesOf } from '@kadira/storybook';

import TandemSettings from '../../src/views/TandemSettings';

storiesOf('TandemSettings', module)
  .add('flat rate', () => (
    <TandemSettings pumpSettings={require('../../data/pumpSettings/tandem/flatrate.json')} />
  ));
