import React from 'react';

import { withDesign } from 'storybook-addon-designs';
import { ThemeProvider } from 'styled-components';
import { withKnobs, optionsKnob as options } from '@storybook/addon-knobs';

import baseTheme from '../app/themes/baseTheme';
import Pill from '../app/components/elements/Pill';

const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Pill',
  decorators: [withDesign, withKnobs, withTheme],
};

const variants = {
  Default: 'default',
  Inverse: 'inverse',
};

const variant = () => options('Variant', variants, 'default', { display: 'inline-radio' });

export const PillStory = () => (
  <React.Fragment>
    <Pill label="status" variant={variant()} colorPalette="blues" text="draft" mr={2} />
    <Pill label="status" variant={variant()} colorPalette="oranges" text="pending" mr={2} />
    <Pill label="status" variant={variant()} colorPalette="indigos" text="submitted" mr={2} />
    <Pill label="status" variant={variant()} colorPalette="cyans" text="claimed" mr={2} />
    <Pill label="status" variant={variant()} colorPalette="pinks" text="expired" mr={2} />
    <Pill label="status" variant={variant()} colorPalette="greens" text="active" mr={2} />
    <Pill label="status" variant={variant()} colorPalette="purples" text="inactive" mr={2} />
  </React.Fragment>
);

PillStory.story = {
  name: 'Basic Pill',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=9%3A0',
    },
  },
};
