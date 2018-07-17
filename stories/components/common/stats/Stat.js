import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { withKnobs, select, button } from '@storybook/addon-knobs';

import Stat, { statTypes } from '../../../../src/components/common/stat/Stat';

let basalBolusData = [
  {
    x: 1,
    y: 0.6,
    type: 'basal',
  },
  {
    x: 2,
    y: 0.4,
    type: 'bolus',
  },
];

let bgRangeData = [
  {
    x: 1,
    y: 0.1,
    type: 'veryLow',
  },
  {
    x: 2,
    y: 0.2,
    type: 'low',
  },
  {
    x: 3,
    y: 0.4,
    type: 'target',
  },
  {
    x: 4,
    y: 0.2,
    type: 'high',
  },
  {
    x: 5,
    y: 0.1,
    type: 'veryHigh',
  },
];


const stories = storiesOf('Stat', module);
stories.addDecorator(withKnobs);

const generateRandom = data => {
  const random = _.map(data, () => Math.random());
  const sum = _.sum(random);

  return _.map(data, (d, i) => ({
    x: d.x,
    y: random[i] / sum,
    type: d.type,
  }));
};

stories.add('basalBolusData', () => {
  const categories = ['basal', 'bolus'];

  const type = select('Type', statTypes, statTypes.barHorizontal, 'STAT');

  button('Update Data', () => {
    basalBolusData = generateRandom(basalBolusData);
  }, 'STAT');

  return (
    <Stat
      data={basalBolusData}
      type={type}
      categories={categories}
    />
  );
});

stories.add('bgRangeData', () => {
  const categories = [
    'veryLow',
    'low',
    'target',
    'high',
    'veryHigh',
  ];

  const type = select('Type', statTypes, statTypes.barHorizontal, 'STAT');

  button('Update Data', () => {
    bgRangeData = generateRandom(bgRangeData);
  }, 'STAT');

  return (
    <Stat
      data={bgRangeData}
      type={type}
      categories={categories}
    />
  );
});
