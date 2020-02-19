import React from 'react';
import styled from 'styled-components';

import { action } from '@storybook/addon-actions';
import { withDesign } from 'storybook-addon-designs';

import Button from '../app/components/componentlibrary/elements/Button';

const TidepoolButton = styled.button`
  background: #6582FF;
  color: white;
  border-radius: 4px;
  border: white 2px solid;
  height: 50px;
  width: 200px;
  font-size: 1em;
`

export default {
  title: 'Examples',
  component: Button,
  decorators: [withDesign]
};

export const Tidepool = () => (
<TidepoolButton onClick={action('Styled Components Button Clicked')}>Styled Components Button</TidepoolButton>
);

Tidepool.story = {
  name: 'Styled Components Button',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153'
    }
  }
}

export const RebassButton = () => (
  <Button>Rebass Button</Button>
  );


RebassButton.story = {
  name: 'Rebass Button',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=51%3A153'
    }
  }
}