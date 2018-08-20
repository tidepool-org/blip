import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { select, button, boolean } from '@storybook/addon-knobs';

import Stat, { statTypes, statFormats } from '../../../../src/components/common/stat/Stat';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY } from '../../../../src/utils/constants';


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

const convertPercentageToDayDuration = value => value * MS_IN_DAY;

const getSum = data => _.sum(_.map(data, d => d.value));

const randomValueByType = (value, type) => {
  switch (type) {
    case 'duration':
      return convertPercentageToDayDuration(value);

    case 'units':
      return value * 70;

    case 'gmi':
      return value / 10 + 0.05;

    default:
      return value;
  }
};

/* eslint-disable no-nested-ternary */
const generateRandom = (data, type) => {
  const random = _.map(data.data, () => Math.random());
  const randomData = _.assign({}, data, {
    data: _.map(data.data, (d, i) => (_.assign({}, d, {
      value: randomValueByType(random[i], type),
    }))),
  });
  randomData.total = _.assign({}, data.total, { value: getSum(randomData.data) });
  return randomData;
};
/* eslint-enable no-nested-ternary */

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

const stories = storiesOf('Stat', module);

let timeInRangeData = {
  data: [
    {
      id: 'veryLow',
      value: convertPercentageToDayDuration(0.01),
      title: 'Time Below Range',
    },
    {
      id: 'low',
      value: convertPercentageToDayDuration(0.03),
      title: 'Time Below Range',
    },
    {
      id: 'target',
      value: convertPercentageToDayDuration(0.7),
      title: 'Time In Range',
    },
    {
      id: 'high',
      value: convertPercentageToDayDuration(0.16),
      title: 'Time Above Range',
    },
    {
      id: 'veryHigh',
      value: convertPercentageToDayDuration(0.1),
      title: 'Time Above Range',
    },
  ],
};
timeInRangeData.total = { value: getSum(timeInRangeData.data) };
timeInRangeData.dataPaths = {
  summary: [
    'data',
    _.findIndex(timeInRangeData.data, { id: 'target' }),
  ],
};

stories.add('Time In Range', () => {
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'PROPS');
  const bgUnits = select('bgPrefs', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'PROPS');
  const bgPrefs = bgPrefsValues[bgUnits];
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'PROPS');
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'PROPS');

  button('Randomize Data', () => {
    timeInRangeData = generateRandom(timeInRangeData, 'duration');
  }, 'PROPS');

  return (
    <Container>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        bgPrefs={bgPrefs}
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={timeInRangeData}
        dataFormat={{
          label: statFormats.percentage,
          summary: statFormats.percentage,
          tooltip: statFormats.duration,
          tooltipTitle: statFormats.bgRange,
        }}
        isOpened={isOpened}
        muteOthersOnHover={muteOthersOnHover}
        title="Time In Range"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

let timeInAutoData = {
  data: [
    {
      id: 'basal',
      value: convertPercentageToDayDuration(0.3),
      title: 'Time In Manual Mode',
    },
    {
      id: 'basalAutomated',
      value: convertPercentageToDayDuration(0.7),
      title: 'Time In Auto Mode',
    },
  ],
  total: { value: 1 },
};
timeInAutoData.total = { value: getSum(timeInAutoData.data) };
timeInAutoData.dataPaths = {
  summary: [
    'data',
    _.findIndex(timeInAutoData.data, { id: 'basalAutomated' }),
  ],
};

stories.add('Time In Auto', () => {
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'PROPS');
  const collapsible = boolean('collapsible', true, 'PROPS');
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'PROPS');

  button('Randomize Data', () => {
    timeInAutoData = generateRandom(timeInAutoData, 'duration');
  }, 'PROPS');

  return (
    <Container>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={timeInAutoData}
        dataFormat={{
          label: statFormats.percentage,
          summary: statFormats.percentage,
          tooltip: statFormats.duration,
        }}
        isOpened={isOpened}
        muteOthersOnHover={muteOthersOnHover}
        title="Time In Auto Mode"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

let totalInsulinData = {
  data: [
    {
      id: 'basal',
      value: 62.9,
      title: 'Basal Insulin',
    },
    {
      id: 'bolus',
      value: 49.5,
      title: 'Bolus Insulin',
    },
  ],
  total: {
    id: 'insulin',
    value: 112.4,
  },
};
totalInsulinData.dataPaths = {
  summary: 'total',
  title: 'total',
};

stories.add('Total Insulin', () => {
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'PROPS');
  const collapsible = boolean('collapsible', true, 'PROPS');
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'PROPS');

  button('Randomize Data', () => {
    totalInsulinData = generateRandom(totalInsulinData, 'units');
  }, 'PROPS');

  return (
    <Container>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={totalInsulinData}
        dataFormat={{
          label: statFormats.percentage,
          summary: statFormats.units,
          title: statFormats.units,
          tooltip: statFormats.units,
        }}
        isOpened={isOpened}
        muteOthersOnHover={muteOthersOnHover}
        title="Total Insulin"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

let averageBgData = {
  data: [
    {
      id: 'averageBg',
      value: 101,
      variability: {
        lower: 76,
        value: 25,
        upper: 126,
      },
      title: 'Coefficient of Variation',
    },
  ],
};
averageBgData.dataPaths = {
  summary: 'data.0',
  hover: 'data.0.variability',
};

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
          label: statFormats.bgValue,
          summary: statFormats.bgValue,
          hover: statFormats.units,
          hoverTitle: statFormats.bgRange,
        }}
        isOpened={isOpened}
        title="Average Blood Glucose"
        type={statTypes.barBg}
      />
    </Container>
  );
});

let glucoseManagementIndexData = {
  data: [
    {
      id: 'gmi',
      value: 0.051,
      title: 'G.M.I. (Estimated A1c)',
    },
  ],
};
glucoseManagementIndexData.dataPaths = {
  summary: 'data.0',
};

stories.add('Glucose Management Index', () => {
  button('Randomize Data', () => {
    glucoseManagementIndexData = generateRandom(glucoseManagementIndexData, 'gmi');
  }, 'PROPS');

  return (
    <Container>
      <Stat
        data={glucoseManagementIndexData}
        title="G.M.I"
        type={statTypes.simple}
        dataFormat={{
          summary: statFormats.gmi,
        }}
      />
    </Container>
  );
});
