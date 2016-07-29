import { scaleLinear } from 'd3-scale';
import React from 'react';

import { storiesOf } from '@kadira/storybook';

import SolidBackground from '../../../../src/components/trends/common/SolidBackground';

const w = 800;
const h = 450;
const props = {
  margins: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  svgDimensions: {
    width: w,
    height: h,
  },
  xScale: scaleLinear().domain([0, 864e5]).range([0, w]),
  yScale: scaleLinear().domain([27, 400]).range([h, 0]),
};

storiesOf('SolidBackground', module)
  .add('without lines', () => (
    <svg width={w} height={h}>
      <SolidBackground {...props} />
    </svg>
  ))
  .add('with lines at three-hour intervals', () => (
    <svg width={w} height={h}>
      <SolidBackground {...props} linesAtThreeHrs />
    </svg>
  ));
