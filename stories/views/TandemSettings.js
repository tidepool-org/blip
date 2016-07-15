import React from 'react';

import { storiesOf } from '@kadira/storybook';

import TandemSettings from '../../src/views/settings/TandemSettings';

storiesOf('TandemSettings', module)
  .add('flat rate', () => {
    // eslint-disable-next-line global-require
    const flatRateSettings = require('../../data/pumpSettings/tandem/flatrate.json');
    return (
      <TandemSettings pumpSettings={flatRateSettings} />
    );
  });
