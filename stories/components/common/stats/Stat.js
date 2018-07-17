import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { withKnobs, select, button } from '@storybook/addon-knobs';

import Stat, { statTypes } from '../../../../src/components/common/stat/Stat';

const basalBolusData = [
  {
    x: 'basal',
    y: 0.6,
  },
  {
    x: 'bolus',
    y: 0.4,
  },
];

const categories = {
  x: ['basal', 'bolus'],
};

const stories = storiesOf('Stat', module);
stories.addDecorator(withKnobs);


stories.add('basalBolusData', () => {
  const type = select('Type', statTypes, statTypes.barHorizontal, 'TYPE-1');
  const dataSource = basalBolusData;
  const data = button('Update Data', () => {
    const initial = Math.random();
    return _.map(dataSource, (d, i) => {
      d.y = i === 0 ? initial : 1 - initial;
      return d;
    });
  }, 'DATA-1');
  return (
    <div>
      <Stat data={data} type={type} categories={categories} />
    </div>
  );
});

stories.add('barHorizontal', () => (
  <div>
    <Stat type="barHorizontal" />
  </div>
));
stories.add('barVertical', () => (
  <div>
    <Stat type="barVertical" />
  </div>
));
stories.add('pie', () => (
  <div>
    <Stat type="pie" />
  </div>
));
