import { scaleLinear } from 'd3-scale';
import React from 'react';

import { storiesOf } from '@kadira/storybook';

import ModalBackground from '../../../../src/components/trends/common/ModalBackground';

const w = 800;
const h = 450;
const props = {
  margins: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  smbgOpts: { maxR: 5 },
  svgDimensions: {
    width: w,
    height: h,
  },
  xScale: scaleLinear().domain([0, 864e5]).range([0, w]),
  yScale: scaleLinear().domain([27, 400]).range([h, 0]),
};

storiesOf('ModalBackground', module)
  .add('without lines', () => (
    <svg width={w} height={h}>
      <ModalBackground {...props} />
    </svg>
  ));
