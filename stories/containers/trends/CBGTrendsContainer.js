import Chance from 'chance';
const chance = new Chance();
import { scaleLinear } from 'd3-scale';
import React from 'react';

import { storiesOf } from '@kadira/storybook';

import CBGTrendsContainer from '../../../src/containers/trends/CBGTrendsContainer';

const w = 960;
const h = 520;

const bgMin = 27;
const bgMax = 481;
const xScale = scaleLinear().domain([0, 864e5]).range([0, w]);
const yScale = scaleLinear().domain([bgMin, bgMax]).range([h, 0]);

const props = {
  bgBounds: {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 80,
    veryLowThreshold: 60,
  },
  bgUnits: 'mg/dL',
  focusedSlice: null,
  focusedSliceKeys: null,
  focusSlice: () => {},
  timezone: 'US/Pacific',
  unfocusSlice: () => {},
  xScale,
  yScale,
};

storiesOf('CBGTrendsContainer', module)

  .add('no data', () => (
    <CBGTrendsContainer data={[]} {...props} />
  ))
  .add('with ~two weeks of data', () => {
    const data = [];
    for (let i = 0; i < 288 * 14; ++i) {
      data.push({
        msPer24: chance.integer({ min: 0, max: 864e5 - 1 }),
        value: chance.natural({ min: bgMin, max: bgMax }),
      });
    }
    return (
      <CBGTrendsContainer data={data} {...props} />
    );
  });
