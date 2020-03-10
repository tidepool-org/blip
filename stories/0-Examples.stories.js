import React from 'react';

import { action } from '@storybook/addon-actions';
import { withDesign } from 'storybook-addon-designs';

import Button from '../app/components/elements/Button';

export default {
  title: 'Example Story',
  decorators: [withDesign],
};

export const ExampleStory = () => (
  <Button onClick={action('Example Button Clicked')}>Example Button</Button>
);

ExampleStory.story = {
  name: 'Example Button',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153',
    },
  },
};
