/* eslint-disable */
import { configure, addDecorator } from '@storybook/react';
import { withNotes } from '@storybook/addon-notes';

addDecorator(withNotes);

function loadStories() {
  const context = require.context('../storiesDatatypes', true, /.js$/); // Load .js files in /storybook
  context.keys().forEach(context);
}

configure(loadStories, module);
