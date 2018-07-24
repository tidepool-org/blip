import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { withKnobs, select, button } from '@storybook/addon-knobs';

import Stat, { statTypes } from '../../../../src/components/common/stat/Stat';

export const chartHeights = {
  fluid: 0,
  80: 80,
  100: 100,
};

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

let autoManualData = [
  {
    x: 1,
    y: 0.75,
    type: 'basalAutomated',
  },
  {
    x: 2,
    y: 0.25,
    type: 'basal',
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

/* eslint-disable react/prop-types */
const Container = (props) => (
  <div
    style={{
      background: '#f6f6f6',
      border: '1px solid #eee',
      margin: '20px',
      padding: '20px',
    }}
  >{props.children}</div>
);
/* eslint-enable react/prop-types */

stories.add('Time In Range', () => {
  const type = select('Type', statTypes, statTypes.barHorizontal, 'STAT');
  const chartHeight = select('Chart Height', chartHeights, chartHeights['100'], 'STAT');

  button('Update Data', () => {
    bgRangeData = generateRandom(bgRangeData);
  }, 'STAT');

  return (
    <Container>
      <Stat
        chartHeight={chartHeight}
        data={bgRangeData}
        title="Time In Range"
        type={type}
      />
    </Container>
  );
});

stories.add('Basal : Bolus Ratio', () => {
  const type = select('Type', statTypes, statTypes.barHorizontal, 'STAT');
  const chartHeight = select('Chart Height', chartHeights, chartHeights['100'], 'STAT');

  button('Update Data', () => {
    basalBolusData = generateRandom(basalBolusData);
  }, 'STAT');

  return (
    <Container>
      <Stat
        chartHeight={chartHeight}
        data={basalBolusData}
        title="Basal : Bolus Ratio"
        type={type}
      />
    </Container>
  );
});

stories.add('Auto Mode : Manual Ratio', () => {
  const type = select('Type', statTypes, statTypes.barHorizontal, 'STAT');
  const chartHeight = select('Chart Height', chartHeights, chartHeights['100'], 'STAT');

  button('Update Data', () => {
    autoManualData = generateRandom(autoManualData);
  }, 'STAT');

  return (
    <Container>
      <Stat
        chartHeight={chartHeight}
        data={autoManualData}
        title="Auto Mode : Manual Ratio"
        type={type}
      />
    </Container>
  );
});
