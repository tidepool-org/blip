import React from 'react';

import { storiesOf } from '@kadira/storybook';

import ChartExplainer from '../../../../src/components/trends/cbg/ChartExplainer';

storiesOf('ChartExplainer', module)
  .add('default', () => (<ChartExplainer />))
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
    return (<ChartExplainer focusedSlice={focusedSlice} />);
  });
