import React from 'react';
import { Flex } from 'rebass/styled-components';
import { withDesign } from 'storybook-addon-designs';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import BgRangeSummary from '../app/components/clinic/BgRangeSummary';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Summaries',
  decorators: [withDesign, withTheme],
};

export const BgRange = () => {
  const summaryData = {
    userId: '3c7df7fa73',
    lastUpdated: '2022-04-04T15:47:21.296Z',
    firstData: '2021-10-30T09:47:43.197Z',
    lastData: '2022-01-26T09:10:00.640Z',
    lastUpload: '2022-03-04T03:52:34.929Z',
    outdatedSince: '2022-04-04T15:47:21.296Z',
    avgGlucose: {
      units: 'mg/dL',
      value: 143.74691180311757,
    },
    glucoseMgmtIndicator: 0.06748426130330572,
    timeInRange: 0.57,
    timeAboveRange: 0.09,
    timeVeryAboveRange: 0.13,
    timeBelowRange: 0.11,
    timeVeryBelowRange: 0.09,
    timeCGMUse: 0.78,
    highGlucoseThreshold: 180,
    lowGlucoseThreshold: 70,
  };

  const bgUnits = summaryData.avgGlucose.units;
  const targetRange = [summaryData.lowGlucoseThreshold, summaryData.highGlucoseThreshold];

  const data = {
    veryLow: summaryData.timeVeryBelowRange,
    low: summaryData.timeBelowRange,
    target: summaryData.timeInRange,
    high: summaryData.timeAboveRange,
    veryHigh: summaryData.timeVeryAboveRange,
  };

  return (
    <Flex justifyContent="center">
      <BgRangeSummary data={data} targetRange={targetRange} bgUnits={bgUnits} />
    </Flex>
  );
};

BgRange.story = {
  name: 'BgRangeSummary',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/d9vb4OAXEkiAf7jbCLkJ0L/%5BShared-with-Dev%5D-Population-Health-Designs?node-id=1127%3A1618',
    },
  },
};
