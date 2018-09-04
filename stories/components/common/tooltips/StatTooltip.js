import React from 'react';

import { storiesOf } from '@storybook/react';

import StatTooltip from '../../../../src/components/common/tooltips/StatTooltip';

const props = {
  position: { top: 105, left: 105 },
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
      top: '100px',
      left: '100px',
      backgroundColor: 'FireBrick',
      opacity: 0.5,
      zIndex: '1',
    }}
  />
);

const stories = storiesOf('StatTooltip', module);
stories.addDecorator(BackgroundDecorator);

stories.add('short message', () => (
  <div>
    {refDiv}
    <StatTooltip {...props} messages={['A nice, concise message.']} />
  </div>
));

stories.add('long message', () => (
  <div>
    {refDiv}
    <StatTooltip {...props} messages={['A longer message that should wrap due to a max-width of 190px set.']} />
  </div>
));

stories.add('multiple messages', () => (
  <div>
    {refDiv}
    <StatTooltip
      {...props}
      messages={[
        'A nice, concise message.',
        'A longer message that should wrap due to a max-width of 190px set.',
      ]}
    />
  </div>
));
