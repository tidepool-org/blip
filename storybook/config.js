/* eslint-disable */
import { configure, addDecorator } from '@storybook/react';
import { withNotes } from '@storybook/addon-notes';
import { withKnobs } from '@storybook/addon-knobs';
import { configureViewport, INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

configureViewport({
  viewports: {
    ...INITIAL_VIEWPORTS,
  }
});

addDecorator(withNotes);
addDecorator(withKnobs);

function loadStories() {
  const context = require.context('../stories', true, /.js$/); // Load .js files in /storybook
  context.keys().forEach(context);
}

configure(loadStories, module);
