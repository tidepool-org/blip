import React from 'react';

import { storiesOf } from '@storybook/react';

import Loader from '../../../../src/components/common/loader/Loader';

const props = {};

const BackgroundDecorator = (story) => (
  <div style={{ backgroundColor: '#ddd', width: '100%', height: '96vh' }}>
    {story()}
  </div>
);

storiesOf('Loader', module)
  .addDecorator(BackgroundDecorator)
  .add('defaults', () => (
    <div>
      <Loader {...props} />
    </div>
  ))
  .add('with overlay', () => (
    <div>
      <Loader {...props} overlay />
    </div>
  ))
  .add('with custom text', () => (
    <div>
      <Loader {...props} text="Ah Yeah :)" />
    </div>
  ))
  .add('with no text', () => (
    <div>
      <Loader {...props} text="" />
    </div>
  ));

