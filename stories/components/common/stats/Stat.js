import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { select, button, boolean, object } from '@storybook/addon-knobs';

import Stat, { statTypes, statFormats } from '../../../../src/components/common/stat/Stat';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../src/utils/constants';


const bgPrefsOptions = {
  [MGDL_UNITS]: MGDL_UNITS,
  [MMOLL_UNITS]: MMOLL_UNITS,
};

const bgPrefsValues = {
  [MGDL_UNITS]: {
    bgBounds: {
      veryHighThreshold: 250,
      targetUpperBound: 180,
      targetLowerBound: 70,
      veryLowThreshold: 54,
    },
    bgUnits: MGDL_UNITS,
  },
  [MMOLL_UNITS]: {
    bgBounds: {
      veryHighThreshold: 13.9,
      targetUpperBound: 10.0,
      targetLowerBound: 3.9,
      veryLowThreshold: 3.0,
    },
    bgUnits: MMOLL_UNITS,
  },
};

const chartHeightOptions = {
  '0 (default fluid)': 0,
  80: 80,
  100: 100,
};

let timeInRangeData = [
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

let timeInAutoData = [
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

let totalInsulinData = [
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

let averageBgData = [
  {
    name: 'averageBg',
    value: 187,
  },
  {
    name: 'coefficientOfVariation',
    value: 25,
  },
];

let glucoseManagementIndexData = [
  {
    name: 'gmi',
    value: 0.051,
  },
];

const stories = storiesOf('Stat', module);

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
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'PROPS');
  const bgUnits = select('bgPrefs', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'PROPS');
  const bgPrefs = bgPrefsValues[bgUnits];
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');

  button('Randomize Data', () => {
    timeInRangeData = generateRandom(timeInRangeData);
  }, 'PROPS');

  return (
    <Container>
      <Stat
        bgPrefs={bgPrefs}
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={timeInRangeData}
        format={{
          datum: statFormats.percentage,
          datumTooltip: statFormats.duration,
          header: statFormats.duration,
          headerTooltip: statFormats.bgRange,
        }}
        isOpened={isOpened}
        title="Time In Range"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

stories.add('Time In Auto', () => {
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'PROPS');
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');

  button('Randomize Data', () => {
    timeInAutoData = generateRandom(timeInAutoData);
  }, 'PROPS');

  return (
    <Container>
      <Stat
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={timeInAutoData}
        format={{
          datum: statFormats.percentage,
          datumTooltip: statFormats.duration,
          header: statFormats.percentage,
        }}
        isOpened={isOpened}
        title="Time In Auto Mode"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

stories.add('Total Insulin', () => {
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'PROPS');
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');

  button('Randomize Data', () => {
    totalInsulinData = generateRandom(totalInsulinData);
  }, 'PROPS');

  return (
    <Container>
      <Stat
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={totalInsulinData}
        format={{
          datum: statFormats.percentage,
          datumTooltip: statFormats.duration,
          header: statFormats.percentage,
          headerTooltip: statFormats.percentage,
        }}
        isOpened={isOpened}
        title="Total Insulin"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

stories.add('Average BG', () => {
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');
  const bgUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'PROPS');
  const bgPrefs = bgPrefsValues[bgUnits];

  button('Randomize Data', () => {
    averageBgData = generateRandom(averageBgData);
  }, 'PROPS');

  return (
    <Container>
      <Stat
        bgPrefs={bgPrefs}
        collapsible={collapsible}
        data={averageBgData}
        format={{
          header: statFormats.units,
          label: statFormats.bgValue,
          tooltip: statFormats.units,
        }}
        isOpened={isOpened}
        title="Average BG"
        type={statTypes.simple}
      />
    </Container>
  );
});

stories.add('Glucose Management Index', () => {
  button('Randomize Data', () => {
    glucoseManagementIndexData = generateRandom(glucoseManagementIndexData);
  }, 'PROPS');

  return (
    <Container>
      <Stat
        data={glucoseManagementIndexData}
        title="G.M.I"
        type={statTypes.simple}
        format={{
          header: statFormats.percentage,
          label: statFormats.percentage,
        }}
      />
    </Container>
  );
});
