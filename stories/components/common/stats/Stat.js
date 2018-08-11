import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { select, button, boolean } from '@storybook/addon-knobs';

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

let timeInRangeData = {
  data: [
    {
      id: 'veryLow',
      value: 0.01,
      hoverTitle: 'Time Below Range',
    },
    {
      id: 'low',
      value: 0.03,
      hoverTitle: 'Time Below Range',
    },
    {
      id: 'target',
      value: 0.7,
      hoverTitle: 'Time In Range',
    },
    {
      id: 'high',
      value: 0.16,
      hoverTitle: 'Time Above Range',
    },
    {
      id: 'veryHigh',
      value: 0.1,
      hoverTitle: 'Time Above Range',
    },
  ],
  total: 1,
};
timeInRangeData.primary = _.find(timeInRangeData, { id: 'target' });

let timeInAutoData = {
  data: [
    {
      id: 'basal',
      value: 0.3,
      hoverTitle: 'Time In Manual Mode',
    },
    {
      id: 'basalAutomated',
      value: 0.7,
      hoverTitle: 'Time In Auto Mode',
    },
  ],
  total: 1,
};
timeInAutoData.primary = _.find(timeInRangeData, { id: 'basalAutomated' });

let totalInsulinData = {
  data: [
    {
      id: 'basal',
      value: 62.9,
      hoverTitle: 'Basal Insulin',
    },
    {
      id: 'bolus',
      value: 49.5,
      hoverTitle: 'Bolus Insulin',
    },
  ],
  total: 112.4,
};
totalInsulinData.primary = _.find(timeInRangeData, { id: 'target' });
totalInsulinData.secondary = _.find(timeInRangeData, { id: 'target' });

let averageBgData = [
  {
    id: 'averageBg',
    value: 187,
  },
  {
    id: 'coefficientOfVariation',
    value: 25,
  },
];

let glucoseManagementIndexData = [
  {
    id: 'gmi',
    value: 0.051,
    hoverTitle: 'G.M.I. (Estimated A1c)',
  },
];

const stories = storiesOf('Stat', module);

const generateRandom = data => {
  const random = _.map(data.data, () => Math.random());
  const sum = _.sum(random);

  return _.assign({}, data, {
    data: _.map(data.data, (d, i) => (_.assign({}, d, {
      value: random[i],
    }))),
    total: sum,
  });
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
        dataFormat={{
          datum: statFormats.percentage,
          datumTooltip: statFormats.duration,
          primary: statFormats.duration,
          secondary: statFormats.bgRange,
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
        dataFormat={{
          datum: statFormats.percentage,
          datumTooltip: statFormats.duration,
          primary: statFormats.percentage,
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
        dataFormat={{
          datum: statFormats.percentage,
          datumTooltip: statFormats.duration,
          primary: statFormats.percentage,
          secondary: statFormats.percentage,
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
        dataFormat={{
          primary: statFormats.units,
          datum: statFormats.bgValue,
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
        dataFormat={{
          primary: statFormats.percentage,
          label: statFormats.percentage,
        }}
      />
    </Container>
  );
});
