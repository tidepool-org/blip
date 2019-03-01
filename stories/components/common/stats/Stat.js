import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { select, button, boolean } from '@storybook/addon-knobs';

import Stat from '../../../../src/components/common/stat/Stat';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY, MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP, MGDL_PER_MMOLL } from '../../../../src/utils/constants';
import { getSum, statFormats, statTypes } from '../../../../src/utils/stat';

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

const convertPercentageToDayDuration = value => (value / 100) * MS_IN_DAY;

const randomValueByType = (type, bgUnits, opts = {}) => {
  const isMGDL = bgUnits === MGDL_UNITS;
  const {
    deviation,
  } = opts;

  switch (type) {
    case 'duration':
      return convertPercentageToDayDuration(_.random(0, 100, true));

    case 'units':
      return _.random(20, 100, true);

    case 'gmi':
      return _.random(4, 15, true);

    case 'carb':
      return _.random(5, 100, true);

    case 'cv':
      return _.random(24, 40, true);

    case 'deviation':
      return _.random(
        isMGDL ? 12 : 12 / MGDL_PER_MMOLL,
        isMGDL ? 48 : 48 / MGDL_PER_MMOLL,
        true
      );

    case 'count':
      return _.random(0, 3);

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

const generateRandomData = (data, type, bgUnits) => {
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

  return randomData;
};

const generateEmptyData = (data) => {
  const randomData = _.assign({}, data, {
    data: _.map(data.data, (d) => (_.assign({}, d, {
      value: -1,
      deviation: d.deviation
        ? _.assign(d.deviation, { value: -1 })
        : undefined,
    }))),
  });

  if (randomData.total) {
    randomData.total = _.assign({}, data.total, { value: getSum(randomData.data) });
  }

  return randomData;
};

/* eslint-disable react/prop-types */
const Container = (props) => (
  <div
    style={{
      background: '#f6f6f6',
      border: '1px solid #eee',
      margin: props.responsive ? '50px' : '50px auto',
      padding: '20px',
      width: props.responsive ? 'auto' : '320px',
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
      value: convertPercentageToDayDuration(0.04),
      title: 'Time Below Range',
      legendTitle: '<54',
    },
    {
      id: 'low',
      value: convertPercentageToDayDuration(3.96),
      title: 'Time Below Range',
      legendTitle: '54-70',
    },
    {
      id: 'target',
      value: convertPercentageToDayDuration(70),
      title: 'Time In Range',
      legendTitle: '70-180',
    },
    {
      id: 'high',
      value: convertPercentageToDayDuration(16),
      title: 'Time Above Range',
      legendTitle: '180-250',
    },
    {
      id: 'veryHigh',
      value: convertPercentageToDayDuration(10),
      title: 'Time Above Range',
      legendTitle: '>250',
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
  const responsive = boolean('responsive', false, 'UI');
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const bgUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'DATA');
  const bgPrefs = bgPrefsValues[bgUnits];
  const alwaysShowTooltips = boolean('alwaysShowTooltips', true, 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');
  const legend = boolean('legend', true, 'UI');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'UI');
  const reverseLegendOrder = boolean('reverseLegendOrder', true, 'UI');

  button('Random Data', () => {
    timeInRangeData = generateRandomData(timeInRangeData, 'duration');
  }, 'DATA');

  button('Empty Data', () => {
    timeInRangeData = generateEmptyData(timeInRangeData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        annotations={[
          'Based on 70% CGM data availability for this view.',
        ]}
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
        legend={legend}
        muteOthersOnHover={muteOthersOnHover}
        reverseLegendOrder={reverseLegendOrder}
        title="Time In Range"
        type={statTypes.barHorizontal}
        units={bgUnits}
      />
    </Container>
  );
});

let readingsInRangeData = {
  data: [
    {
      id: 'veryLow',
      value: 0,
      title: 'Readings Below Range',
      legendTitle: '<54',
    },
    {
      id: 'low',
      value: 1,
      title: 'Readings Below Range',
      legendTitle: '54-70',
    },
    {
      id: 'target',
      value: 3,
      title: 'Readings In Range',
      legendTitle: '70-180',
    },
    {
      id: 'high',
      value: 2,
      title: 'Readings Above Range',
      legendTitle: '180-250',
    },
    {
      id: 'veryHigh',
      value: 1,
      title: 'Readings Above Range',
      legendTitle: '>250',
    },
  ],
};
readingsInRangeData.total = { value: getSum(readingsInRangeData.data) };
readingsInRangeData.dataPaths = {
  summary: [
    'data',
    _.findIndex(readingsInRangeData.data, { id: 'target' }),
  ],
};

stories.add('Readings In Range', () => {
  const responsive = boolean('responsive', false, 'UI');
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const bgUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'DATA');
  const bgPrefs = bgPrefsValues[bgUnits];
  const alwaysShowTooltips = boolean('alwaysShowTooltips', true, 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');
  const legend = boolean('legend', true, 'UI');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'UI');
  const reverseLegendOrder = boolean('reverseLegendOrder', true, 'UI');

  button('Random Data', () => {
    readingsInRangeData = generateRandomData(readingsInRangeData, 'count');
  }, 'DATA');

  button('Empty Data', () => {
    readingsInRangeData = generateEmptyData(readingsInRangeData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        annotations={[
          'Based on 7 SMBG readings for this view.',
        ]}
        bgPrefs={bgPrefs}
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={readingsInRangeData}
        dataFormat={{
          label: statFormats.bgCount,
          summary: statFormats.bgCount,
          tooltip: statFormats.percentage,
          tooltipTitle: statFormats.bgRange,
        }}
        isOpened={isOpened}
        legend={legend}
        muteOthersOnHover={muteOthersOnHover}
        reverseLegendOrder={reverseLegendOrder}
        title="Readings In Range"
        type={statTypes.barHorizontal}
        units={bgUnits}
      />
    </Container>
  );
});

let timeInAutoData = {
  data: [
    {
      id: 'basal',
      value: convertPercentageToDayDuration(30),
      title: 'Time In Manual Mode',
      legendTitle: 'Manual Mode',
    },
    {
      id: 'basalAutomated',
      value: convertPercentageToDayDuration(70),
      title: 'Time In Auto Mode',
      legendTitle: 'Auto Mode',
    },
  ],
};
timeInAutoData.total = { value: getSum(timeInAutoData.data) };
timeInAutoData.dataPaths = {
  summary: [
    'data',
    _.findIndex(timeInAutoData.data, { id: 'basalAutomated' }),
  ],
};

stories.add('Time In Auto', () => {
  const responsive = boolean('responsive', false, 'UI');
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const alwaysShowTooltips = boolean('alwaysShowTooltips', true, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');
  const legend = boolean('legend', true, 'UI');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'UI');

  button('Random Data', () => {
    timeInAutoData = generateRandomData(timeInAutoData, 'duration');
  }, 'DATA');

  button('Empty Data', () => {
    timeInAutoData = generateEmptyData(timeInAutoData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        annotations={[
          'Based on 50% pump data availability for this view.',
        ]}
        chartHeight={chartHeight}
        collapsible={collapsible}
        data={timeInAutoData}
        dataFormat={{
          label: statFormats.percentage,
          summary: statFormats.percentage,
          tooltip: statFormats.duration,
        }}
        isOpened={isOpened}
        legend={legend}
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
      id: 'bolus',
      value: 49.5,
      title: 'Bolus Insulin',
      legendTitle: 'Bolus',
    },
    {
      id: 'basal',
      value: 62.9,
      title: 'Basal Insulin',
      legendTitle: 'Basal',
    },
  ],
};
totalInsulinData.total = { id: 'insulin', value: getSum(totalInsulinData.data) };
totalInsulinData.dataPaths = {
  summary: 'total',
  title: 'total',
};

stories.add('Total Insulin', () => {
  const responsive = boolean('responsive', false, 'UI');
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const alwaysShowTooltips = boolean('alwaysShowTooltips', true, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');
  const legend = boolean('legend', true, 'UI');
  const muteOthersOnHover = boolean('muteOthersOnHover', true, 'UI');

  button('Random Data', () => {
    totalInsulinData = generateRandomData(totalInsulinData, 'units');
  }, 'DATA');

  button('Empty Data', () => {
    totalInsulinData = generateEmptyData(totalInsulinData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        alwaysShowTooltips={alwaysShowTooltips}
        annotations={[
          'Based on 50% pump data availability for this view.',
        ]}
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
        legend={legend}
        muteOthersOnHover={muteOthersOnHover}
        title="Total Insulin"
        type={statTypes.barHorizontal}
      />
    </Container>
  );
});

let averageGlucoseData = {
  data: [
    {
      value: 101,
    },
  ],
};
averageGlucoseData.dataPaths = {
  summary: 'data.0',
};

let averageGlucoseDataMmol = _.assign({}, averageGlucoseData, {
  data: _.map(averageGlucoseData.data, d => _.assign({}, d, { value: d.value / MGDL_PER_MMOLL })),
});

let averageGlucoseDataUnits = bgPrefsOptions[MGDL_UNITS];

stories.add('Average Glucose', () => {
  const responsive = boolean('responsive', false, 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');
  averageGlucoseDataUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'DATA');
  const bgPrefs = bgPrefsValues[averageGlucoseDataUnits];

  button('Random Data', () => {
    if (averageGlucoseDataUnits === MGDL_UNITS) {
      averageGlucoseData = generateRandomData(averageGlucoseData, 'bg', averageGlucoseDataUnits);
    } else {
      averageGlucoseDataMmol = generateRandomData(averageGlucoseDataMmol, 'bg', averageGlucoseDataUnits);
    }
  }, 'DATA');

  button('Empty Data', () => {
    if (averageGlucoseDataUnits === MGDL_UNITS) {
      averageGlucoseData = generateEmptyData(averageGlucoseData);
    } else {
      averageGlucoseDataMmol = generateEmptyData(averageGlucoseDataMmol);
    }
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        annotations={[
          'Based on 70% CGM data availability for this view.',
          'Average Blood Glucose (mean) is all glucose values added together, divided by the number of readings.',
        ]}
        bgPrefs={bgPrefs}
        collapsible={collapsible}
        data={averageGlucoseDataUnits === MGDL_UNITS ? averageGlucoseData : averageGlucoseDataMmol}
        dataFormat={{
          label: statFormats.bgValue,
          summary: statFormats.bgValue,
        }}
        isOpened={isOpened}
        title="Average Glucose"
        type={statTypes.barBg}
        units={averageGlucoseDataUnits}
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
  const responsive = boolean('responsive', false, 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');
  standardDevDataUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'DATA');
  const bgPrefs = bgPrefsValues[standardDevDataUnits];

  button('Random Data', () => {
    if (standardDevDataUnits === MGDL_UNITS) {
      standardDevData = generateRandomData(standardDevData, 'bg', standardDevDataUnits);
    } else {
      standardDevDataMmol = generateRandomData(standardDevDataMmol, 'bg', standardDevDataUnits);
    }
  }, 'DATA');

  button('Empty Data', () => {
    if (standardDevDataUnits === MGDL_UNITS) {
      standardDevData = generateEmptyData(standardDevData);
    } else {
      standardDevDataMmol = generateEmptyData(standardDevDataMmol);
    }
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        annotations={[
          'Based on 70% CGM data availability for this view.',
          'SD (Standard Deviation) is…',
        ]}
        bgPrefs={bgPrefs}
        collapsible={collapsible}
        data={standardDevDataUnits === MGDL_UNITS ? standardDevData : standardDevDataMmol}
        dataFormat={{
          label: statFormats.standardDevValue,
          summary: statFormats.standardDevValue,
          title: statFormats.standardDevRange,
        }}
        isOpened={isOpened}
        title="Standard Deviation"
        type={statTypes.barBg}
        units={standardDevDataUnits}
      />
    </Container>
  );
});

let glucoseManagementIndicatorData = {
  data: [
    {
      id: 'gmi',
      value: 5.1,
    },
  ],
};
glucoseManagementIndicatorData.dataPaths = {
  summary: 'data.0',
};

stories.add('Glucose Management Indicator', () => {
  const responsive = boolean('responsive', false, 'UI');
  button('Random Data', () => {
    glucoseManagementIndicatorData = generateRandomData(glucoseManagementIndicatorData, 'gmi');
  }, 'DATA');

  button('Empty Data', () => {
    glucoseManagementIndicatorData = generateEmptyData(glucoseManagementIndicatorData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        annotations={[
          'Based on 70% CGM data availability for this view.',
          'GMI (Glucose Management Indicator) is an estimate of HbA1c that has been calculated based on your average blood glucose.',
        ]}
        data={glucoseManagementIndicatorData}
        dataFormat={{
          summary: statFormats.gmi,
        }}
        title="GMI"
        type={statTypes.simple}
      />
    </Container>
  );
});

let coefficientOfVariationData = {
  data: [
    {
      id: 'cv',
      value: 36,
    },
  ],
};
coefficientOfVariationData.dataPaths = {
  summary: 'data.0',
};

stories.add('Coefficient of Variation', () => {
  const responsive = boolean('responsive', false, 'UI');
  button('Random Data', () => {
    coefficientOfVariationData = generateRandomData(coefficientOfVariationData, 'cv');
  }, 'DATA');

  button('Empty Data', () => {
    coefficientOfVariationData = generateEmptyData(coefficientOfVariationData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        annotations={[
          'Based on 70% CGM data availability for this view.',
          'CV (Coefficient of Variation) is…',
        ]}
        data={coefficientOfVariationData}
        dataFormat={{
          summary: statFormats.cv,
        }}
        title="CV"
        type={statTypes.simple}
      />
    </Container>
  );
});

let carbData = {
  data: [
    {
      value: 60,
    },
  ],
};
carbData.dataPaths = {
  summary: 'data.0',
};

stories.add('Avg. Daily Carbs', () => {
  const responsive = boolean('responsive', false, 'UI');
  button('Random Data', () => {
    carbData = generateRandomData(carbData, 'carb');
  }, 'DATA');

  button('Empty Data', () => {
    carbData = generateEmptyData(carbData);
  }, 'DATA');

  return (
    <Container responsive={responsive}>
      <Stat
        annotations={[
          'Based on 5 bolus wizard events for this view.',
        ]}
        data={carbData}
        dataFormat={{
          summary: statFormats.carbs,
        }}
        title="Avg. Daily Carbs"
        type={statTypes.simple}
      />
    </Container>
  );
});

const dailyDoseUnitOptions = [
  {
    label: 'kg',
    value: 'kg',
  },
  {
    label: 'lb',
    value: 'lb',
  },
];

const input = {
  id: 'weight',
  label: 'Weight',
  type: 'number',
};

const staticSuffix = 'kg';

const dynamicSuffix = {
  id: 'units',
  options: dailyDoseUnitOptions,
  value: dailyDoseUnitOptions[0],
};

let dailyDoseData = {
  data: [
    {
      id: 'insulin',
      staticInput: {
        ...input,
        suffix: staticSuffix,
      },
      dynamicInput: {
        ...input,
        suffix: dynamicSuffix,
      },
      output: {
        label: 'Daily Dose ÷ Weight',
        type: 'divisor',
        dataPaths: {
          dividend: 'data.0',
        },
      },
      value: 112.4,
    },
  ],
};
dailyDoseData.dataPaths = {
  // input: 'data.0.staticInput',
  input: 'data.0.dynamicInput',
  output: 'data.0.output',
  summary: 'data.0',
};

stories.add('Avg. Daily Insulin', () => {
  const responsive = boolean('responsive', false, 'UI');
  const collapsible = boolean('collapsible', false, 'UI');
  const isOpened = boolean('isOpened', true, 'UI');

  button('Random Data', () => {
    dailyDoseData = generateRandomData(dailyDoseData, 'units');
  }, 'DATA');

  button('Empty Data', () => {
    dailyDoseData = generateEmptyData(dailyDoseData);
  }, 'DATA');

  const handleInputChange = (value, suffixValue) => {
    console.log('onInputChange called with:', value, suffixValue); // eslint-disable-line no-console
  };

  return (
    <Container responsive={responsive}>
      <Stat
        alwaysShowSummary
        annotations={[
          'Based on 50% pump data availability for this view.',
        ]}
        collapsible={collapsible}
        data={dailyDoseData}
        dataFormat={{
          output: statFormats.unitsPerKg,
          summary: statFormats.units,
        }}
        isOpened={isOpened}
        onInputChange={handleInputChange}
        title="Avg. Daily Dose"
        type={statTypes.input}
      />
    </Container>
  );
});
