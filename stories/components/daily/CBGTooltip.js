import React from 'react';

import { storiesOf } from '@storybook/react';

import CBGTooltip from '../../../src/components/daily/cbgtooltip/CBGTooltip';

const bgPrefs = {
  bgClasses: {
    'very-high': { boundary: 600 },
    high: { boundary: 300 },
    target: { boundary: 180 },
    low: { boundary: 70 },
    'very-low': { boundary: 54 },
  },
  bgUnits: 'mg/dL',
};

const target = {
  type: 'cbg',
  units: 'mg/dL',
  value: 100,
};

const low = {
  type: 'cbg',
  units: 'mg/dL',
  value: 65,
};

const high = {
  type: 'cbg',
  units: 'mg/dL',
  value: 200,
};

const veryHigh = {
  type: 'cbg',
  units: 'mg/dL',
  value: 601,
  annotations: [
    {
      code: 'bg/out-of-range',
      value: 'high',
      threshold: 600,
    },
  ],
};

const veryLow = {
  type: 'cbg',
  units: 'mg/dL',
  value: 39,
  annotations: [
    {
      code: 'bg/out-of-range',
      value: 'low',
      threshold: 40,
    },
  ],
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
  bgPrefs,
};

const BackgroundDecorator = story => (
  <div style={{ backgroundColor: 'FloralWhite', width: '100%', height: '96vh' }}>{story()}</div>
);

const refDiv = (
  <div
    style={{
      position: 'absolute',
      width: '10px',
      height: '10px',
      top: '199px',
      left: '199px',
      backgroundColor: 'FireBrick',
      opacity: 0.5,
      zIndex: '1',
    }}
  />
);

storiesOf('CBGTooltip', module)
  .addDecorator(BackgroundDecorator)
  .add('target', () => (
    <div>
      {refDiv}
      <CBGTooltip {...props} cbg={target} />
    </div>
  ))
  .add('low', () => (
    <div>
      {refDiv}
      <CBGTooltip {...props} cbg={low} />
    </div>
  ))
  .add('high', () => (
    <div>
      {refDiv}
      <CBGTooltip {...props} cbg={high} />
    </div>
  ))
  .add('veryHigh', () => (
    <div>
      {refDiv}
      <CBGTooltip {...props} cbg={veryHigh} />
    </div>
  ))
  .add('veryLow', () => (
    <div>
      {refDiv}
      <CBGTooltip {...props} cbg={veryLow} />
    </div>
  ));
