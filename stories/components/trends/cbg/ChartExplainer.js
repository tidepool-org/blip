import React from 'react';

import { storiesOf } from '@kadira/storybook';

import ChartExplainer from '../../../../src/components/trends/cbg/ChartExplainer';

storiesOf('ChartExplainer', module)
  .add('focused cbg slice', () => {
    const focusedSlice = {
      msFrom: 0,
      msTo: 1800000,
      firstQuartile: 84,
      thirdQuartile: 145,
      tenthQuantile: 63,
      ninetiethQuantile: 192,
      median: 101,
      min: 46,
      max: 307,
    };
    const wrappingDivStyles = {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      position: 'relative',
      width: '980px',
      height: '340px',
      'background-color': 'white',
    };
    return (
      <div style={wrappingDivStyles}>
        <svg width="960" height="320" style={{ display: 'block', margin: '0 auto' }}>
          <rect width="960" height="320" x="0" y="0" fill="#EEE" />
        </svg>
        <ChartExplainer bgUnits="mg/dL" focusedSlice={focusedSlice} />
      </div>
    );
  });
