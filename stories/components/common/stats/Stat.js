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
    name: 'basal',
    x: 1,
    y: 0.6,
  },
  {
    name: 'bolus',
    x: 2,
    y: 0.4,
  },
];

let autoManualData = [
  {
    name: 'basalAutomated',
    x: 1,
    y: 0.75,
  },
  {
    name: 'basal',
    x: 2,
    y: 0.25,
  },
];

let bgRangeData = [
  {
    name: 'veryLow',
    x: 1,
    y: 0.1,
  },
  {
    name: 'low',
    x: 2,
    y: 0.2,
  },
  {
    name: 'target',
    x: 3,
    y: 0.4,
  },
  {
    name: 'high',
    x: 4,
    y: 0.2,
  },
  {
    name: 'veryHigh',
    x: 5,
    y: 0.1,
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
    name: d.name,
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
  >{props.children}
  </div>
);
/* eslint-enable react/prop-types */

stories.add('Time In Range', () => {
  const type = select('Type', statTypes, statTypes.barHorizontal, 'STAT');
  const chartHeight = select('Chart Height', chartHeights, chartHeights.fluid, 'STAT');

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
  const chartHeight = select('Chart Height', chartHeights, chartHeights.fluid, 'STAT');

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
  const chartHeight = select('Chart Height', chartHeights, chartHeights.fluid, 'STAT');

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
