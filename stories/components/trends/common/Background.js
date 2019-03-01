import { scaleLinear } from 'd3-scale';
import React from 'react';

import { storiesOf } from '@storybook/react';

// eslint-disable-next-line max-len
import Background from '../../../../src/components/trends/common/Background';

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
};

storiesOf('Background', module)
  .add('without lines', () => (
    <svg width={w} height={h}>
      <Background {...props} />
    </svg>
  ))
  .add('with lines at three-hour intervals', () => (
    <svg width={w} height={h}>
      <Background {...props} linesAtThreeHrs />
    </svg>
  ));
