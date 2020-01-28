import React from 'react';

import { action } from '@storybook/addon-actions';
import { Button } from '@storybook/react/demo';
import { withDesign } from 'storybook-addon-designs';

import TidepoolButton from '../app/components/componentlibrary/components/TidepoolButton';

export default {
  title: 'Test Stories',
  component: Button,
  decorators: [withDesign]
};

export const Tidepool = () => <TidepoolButton onClick={action('clicked Tidepool Button')}/>;

Tidepool.story = {
  name: 'Tidepool Button',
};

export const myStory = () =>
  <div>
    <Button onClick={action('clicked Figma Button')}>Figma Button</Button>
    <p>Select "Design" below to compare this to the design from the figma url in the story</p>
  </div>;


myStory.story = {
  name: 'Figma Example',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File'
    }
  }
}

//Leaving these here until we have more of our own as a pattern to refer to -- remove before pushing to develop