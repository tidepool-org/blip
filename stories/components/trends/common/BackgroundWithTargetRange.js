import { scaleLinear } from 'd3-scale';
import React from 'react';

import { storiesOf } from '@kadira/storybook';

// eslint-disable-next-line max-len
import BackgroundWithTargetRange from '../../../../src/components/trends/common/BackgroundWithTargetRange';

const w = 800;
const h = 450;
const props = {
  bgBounds: {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 80,
    veryLowThreshold: 60,
  },
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

storiesOf('BackgroundWithTargetRange', module)
  .add('without lines', () => (
    <svg width={w} height={h}>
      <BackgroundWithTargetRange {...props} />
    </svg>
  ))
  .add('with lines at three-hour intervals', () => (
    <svg width={w} height={h}>
      <BackgroundWithTargetRange {...props} linesAtThreeHrs />
    </svg>
  ));
