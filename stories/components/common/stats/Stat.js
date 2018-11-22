import React from 'react';
import _ from 'lodash';

import { storiesOf } from '@storybook/react';
import { select, button, boolean } from '@storybook/addon-knobs';

import Stat from '../../../../src/components/common/stat/Stat';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY, MGDL_CLAMP_TOP, MMOLL_CLAMP_TOP, MGDL_PER_MMOLL } from '../../../../src/utils/constants';
import { statFormats, statTypes } from '../../../../src/utils/stat';

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
const Container = (UI) => (
  <div
    style={{
      background: '#f6f6f6',
      border: '1px solid #eee',
      margin: '50px',
      padding: '20px',
    }}
  >{UI.children}
  </div>
);
/* eslint-enable react/prop-types */

const stories = storiesOf('Stat', module);

let timeInRangeData = {
  data: [
    {
      id: 'veryLow',
      // value: convertPercentageToDayDuration(0.0004),
      value: convertPercentageToDayDuration(0.004),
      title: 'Time Below Range',
      legendTitle: '<54',
    },
    {
      id: 'low',
      // value: convertPercentageToDayDuration(0.0396),
      value: convertPercentageToDayDuration(0.036),
      title: 'Time Below Range',
      legendTitle: '54-70',
    },
    {
      id: 'target',
      value: convertPercentageToDayDuration(0.7),
      title: 'Time In Range',
      legendTitle: '70-180',
    },
    {
      id: 'high',
      value: convertPercentageToDayDuration(0.16),
      title: 'Time Above Range',
      legendTitle: '180-250',
    },
    {
      id: 'veryHigh',
      value: convertPercentageToDayDuration(0.1),
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
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const bgUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'DATA');
  const bgPrefs = bgPrefsValues[bgUnits];
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'UI');
  const collapsible = boolean('collapsible', true, 'UI');
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
    <Container>
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
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const bgUnits = select('BG Units', bgPrefsOptions, bgPrefsOptions[MGDL_UNITS], 'DATA');
  const bgPrefs = bgPrefsValues[bgUnits];
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'UI');
  const collapsible = boolean('collapsible', true, 'UI');
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
    <Container>
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
      />
    </Container>
  );
});

let timeInAutoData = {
  data: [
    {
      id: 'basal',
      // value: convertPercentageToDayDuration(0.3),
      value: convertPercentageToDayDuration(0),
      title: 'Time In Manual Mode',
      legendTitle: 'Manual Mode',
    },
    {
      id: 'basalAutomated',
      // value: convertPercentageToDayDuration(0.7),
      value: convertPercentageToDayDuration(1),
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
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const collapsible = boolean('collapsible', true, 'UI');
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'UI');
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
    <Container>
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
      // value: 0,
      title: 'Bolus Insulin',
      legendTitle: 'Bolus',
    },
    {
      id: 'basal',
      // value: 62.9,
      value: 0,
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
  const chartHeight = select('chartHeight', chartHeightOptions, chartHeightOptions['0 (default fluid)'], 'UI');
  const collapsible = boolean('collapsible', true, 'UI');
  const alwaysShowTooltips = boolean('alwaysShowTooltips', false, 'UI');
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
    <Container>
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
  const collapsible = boolean('collapsible', true, 'UI');
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
    <Container>
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
  const collapsible = boolean('collapsible', true, 'UI');
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
    <Container>
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
      />
    </Container>
  );
});

let glucoseManagementIndicatorData = {
  data: [
    {
      id: 'gmi',
      value: 0.051,
    },
  ],
};
glucoseManagementIndicatorData.dataPaths = {
  summary: 'data.0',
};

stories.add('Glucose Management Indicator', () => {
  button('Random Data', () => {
    glucoseManagementIndicatorData = generateRandomData(glucoseManagementIndicatorData, 'gmi');
  }, 'DATA');

  button('Empty Data', () => {
    glucoseManagementIndicatorData = generateEmptyData(glucoseManagementIndicatorData);
  }, 'DATA');

  return (
    <Container>
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
      value: 0.36,
    },
  ],
};
coefficientOfVariationData.dataPaths = {
  summary: 'data.0',
};

stories.add('Coefficient of Variation', () => {
  button('Random Data', () => {
    coefficientOfVariationData = generateRandomData(coefficientOfVariationData, 'cv');
  }, 'DATA');

  button('Empty Data', () => {
    coefficientOfVariationData = generateEmptyData(coefficientOfVariationData);
  }, 'DATA');

  return (
    <Container>
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
