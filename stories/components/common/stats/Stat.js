import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { select, button, boolean } from '@storybook/addon-knobs';

import Stat, { statTypes, statFormats } from '../../../../src/components/common/stat/Stat';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY, MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP, MGDL_PER_MMOLL } from '../../../../src/utils/constants';

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

const randomValueByType = (type, bgUnits, opts = {}) => {
  const isMGDL = bgUnits === MGDL_UNITS;
  const {
    deviation,
  } = opts;

  switch (type) {
    case 'duration':
      return convertPercentageToDayDuration(_.random(0, 1, true));

    case 'units':
      return _.random(20, 100, true);

    case 'gmi':
      return _.random(0.04, 0.15, true);

    case 'cv':
      return _.random(0.24, 0.40, true);

    case 'deviation':
      return _.random(
        isMGDL ? 12 : 12 / MGDL_PER_MMOLL,
        isMGDL ? 48 : 48 / MGDL_PER_MMOLL,
        true
      );

    case 'bg':
      return _.random(
        isMGDL ? 18 + deviation : 1 + deviation,
        isMGDL ? MGDL_CLAMP_TOP - deviation : MMOLL_CLAMP_TOP - deviation,
        true
      );

    default:
      return _.random(0, 1, true);
  }
};

const generateRandom = (data, type, bgUnits) => {
  const deviation = { value: randomValueByType('deviation', bgUnits) };

  const randomData = _.assign({}, data, {
    data: _.map(data.data, (d) => (_.assign({}, d, {
      value: randomValueByType(type, bgUnits, {
        deviation: d.deviation ? deviation.value : 0,
      }),
      deviation: d.deviation ? deviation : undefined,
    }))),
  });
  if (randomData.total) {
    randomData.total = _.assign({}, data.total, { value: getSum(randomData.data) });
  }

  console.log(randomData)
  return randomData;
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
      value: 101,
    },
  ],
};
averageBgData.dataPaths = {
  summary: 'data.0',
};

let averageBgDataMmol = _.assign({}, averageBgData, {
  data: _.map(averageBgData.data, d => _.assign({}, d, { value: d.value / MGDL_PER_MMOLL })),
});

let averageBgDataUnits = bgPrefsOptions[MGDL_UNITS];

stories.add('Average BG', () => {
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');
  averageBgDataUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'PROPS');
  const bgPrefs = bgPrefsValues[averageBgDataUnits];

  button('Randomize Data', () => {
    if (averageBgDataUnits === MGDL_UNITS) {
      averageBgData = generateRandom(averageBgData, 'bg', averageBgDataUnits);
    } else {
      averageBgDataMmol = generateRandom(averageBgData, 'bg', averageBgDataUnits);
    }
  }, 'PROPS');

  return (
    <Container>
      <Stat
        bgPrefs={bgPrefs}
        collapsible={collapsible}
        data={averageBgDataUnits === MGDL_UNITS ? averageBgData : averageBgDataMmol}
        dataFormat={{
          label: statFormats.bgValue,
          summary: statFormats.bgValue,
        }}
        isOpened={isOpened}
        title="Average Blood Glucose"
        type={statTypes.barBg}
      />
    </Container>
  );
});

let standardDevData = {
  data: [
    {
      value: 101,
      deviation: {
        value: 25,
      },
    },
  ],
};
standardDevData.dataPaths = {
  summary: 'data.0.deviation',
  title: 'data.0',
};

let standardDevDataMmol = _.assign({}, standardDevData, {
  data: _.map(standardDevData.data, d => _.assign({}, d, {
    value: d.value / MGDL_PER_MMOLL,
    deviation: { value: d.deviation.value / MGDL_PER_MMOLL },
  })),
});

let standardDevDataUnits = bgPrefsOptions[MGDL_UNITS];

stories.add('Standard Deviation', () => {
  const collapsible = boolean('collapsible', true, 'PROPS');
  const isOpened = boolean('isOpened', true, 'PROPS');
  standardDevDataUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'PROPS');
  const bgPrefs = bgPrefsValues[standardDevDataUnits];

  button('Randomize Data', () => {
    if (standardDevDataUnits === MGDL_UNITS) {
      standardDevData = generateRandom(standardDevData, 'bg', standardDevDataUnits);
    } else {
      standardDevDataMmol = generateRandom(standardDevData, 'bg', standardDevDataUnits);
    }
  }, 'PROPS');

  return (
    <Container>
      <Stat
        bgPrefs={bgPrefs}
        collapsible={collapsible}
        data={standardDevDataUnits === MGDL_UNITS ? standardDevData : standardDevDataMmol}
        dataFormat={{
          label: statFormats.stdDevValue,
          summary: statFormats.stdDevValue,
          title: statFormats.stdDevRange,
        }}
        isOpened={isOpened}
        title="Standard Deviation"
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
    },
  ],
};
glucoseManagementIndexData.dataPaths = {
  summary: 'data.0',
};

stories.add('Glucose Management Indicator', () => {
  button('Randomize Data', () => {
    glucoseManagementIndexData = generateRandom(glucoseManagementIndexData, 'gmi');
  }, 'PROPS');

  return (
    <Container>
      <Stat
        data={glucoseManagementIndexData}
        title="G.M.I."
        type={statTypes.simple}
        dataFormat={{
          summary: statFormats.gmi,
        }}
      />
    </Container>
  );
});

let coefficientOfVariationData = {
  data: [
    {
      id: 'cv',
      value: 0.3615,
    },
  ],
};
coefficientOfVariationData.dataPaths = {
  summary: 'data.0',
};

stories.add('Coefficient of Variation', () => {
  button('Randomize Data', () => {
    coefficientOfVariationData = generateRandom(coefficientOfVariationData, 'cv');
  }, 'PROPS');

  return (
    <Container>
      <Stat
        data={coefficientOfVariationData}
        title="C.V."
        type={statTypes.simple}
        dataFormat={{
          summary: statFormats.cv,
        }}
      />
    </Container>
  );
});
